package com.mednex.mednex_enterprise.module.clinical.ipd.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.AdmissionRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.BedRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.DailyRoundRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.WardRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.EquipmentRequest;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.EquipmentRequestRepository;
import java.util.Optional;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.Vitals;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.VitalsRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.VitalsResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.VitalsRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.MedicationAdministrationRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.PrescriptionRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.Prescription;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.PrescriptionResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IpdService {

    private static final Logger log = LoggerFactory.getLogger(IpdService.class);

    private final WardRepository wardRepository;
    private final BedRepository bedRepository;
    private final AdmissionRepository admissionRepository;
    private final DailyRoundRepository dailyRoundRepository;
    private final PatientRepository patientRepository;
    private final VitalsRepository vitalsRepository;
    private final EquipmentRequestRepository equipmentRequestRepository;
    private final MedicationAdministrationRepository medicationAdministrationRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional(readOnly = true)
    public List<WardDTO> getWardsByBranch(UUID branchId) {
        log.info("Fetching wards for branch {}", branchId);
        return wardRepository.findByBranchId(branchId).stream().map(ward -> {
            long occupied = bedRepository.countByWardIdAndStatus(ward.getId(), BedStatus.OCCUPIED);
            long available = bedRepository.countByWardIdAndStatus(ward.getId(), BedStatus.AVAILABLE);
            return WardDTO.builder()
                    .id(ward.getId())
                    .name(ward.getName())
                    .branchId(ward.getBranch().getId())
                    .totalCapacity(ward.getTotalCapacity())
                    .occupiedBeds(occupied)
                    .availableBeds(available)
                    .createdAt(ward.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BedDTO> getBedsByWard(UUID wardId) {
        log.info("Fetching beds for ward {}", wardId);
        return bedRepository.findByWardId(wardId).stream().map(bed -> BedDTO.builder()
                .id(bed.getId())
                .roomId(bed.getRoom() != null ? bed.getRoom().getId() : null)
                .bedNumber(bed.getBedNumber())
                .status(bed.getStatus())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public AdmissionDTO requestAdmission(User currentUser, AdmissionRequestDTO request) {
        log.info("Requesting admission for patient {} by doctor {}", request.getPatientId(), currentUser.getId());
        
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        // Verify if patient is already admitted or has a pending request
        if (admissionRepository
                .findTopByPatientIdAndStatusOrderByAdmissionDateDesc(patient.getId(), AdmissionStatus.ADMITTED)
                .isPresent()) {
            throw new IllegalStateException("Patient is already admitted");
        }
        
        if (admissionRepository
                .findTopByPatientIdAndStatusOrderByAdmissionDateDesc(patient.getId(), AdmissionStatus.REQUESTED)
                .isPresent()) {
            throw new IllegalStateException("Patient already has a pending admission request");
        }

        Admission admission = Admission.builder()
                .patient(patient)
                .admittingDoctor(currentUser)
                .admissionDate(LocalDateTime.now())
                .status(AdmissionStatus.REQUESTED)
                .reasonForAdmission(request.getReasonForAdmission())
                .urgencyLevel(request.getUrgencyLevel())
                .department(request.getDepartment())
                .build();

        Admission savedAdmission = admissionRepository.save(admission);
        return mapToAdmissionDTO(savedAdmission);
    }

    @Transactional(readOnly = true)
    public List<AdmissionDTO> getPendingAdmissions() {
        log.info("Fetching all pending admission requests");
        return admissionRepository.findByStatusOrderByAdmissionDateDesc(AdmissionStatus.REQUESTED)
                .stream().map(this::mapToAdmissionDTO).collect(Collectors.toList());
    }

    @Transactional
    public AdmissionDTO admitPatient(User currentUser, AdmissionRequest request) {
        // This is now the "Assign Bed" flow for Receptionist
        log.info("Admitting patient for request {} with bed {}", request.getPatientId(), request.getBedId());

        Admission admission;
        // Check if there's an existing request for this patient ID (which could be the admission ID passed from UI)
        // In the new flow, the UI might pass the Admission ID as request.getPatientId() if it's an existing request.
        // Let's check for both possibilities.
        
        Optional<Admission> existingAdmission = admissionRepository.findById(request.getPatientId());
        if (existingAdmission.isPresent()) {
            admission = existingAdmission.get();
        } else {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient or Admission Request not found"));
            
            admission = admissionRepository
                    .findTopByPatientIdAndStatusOrderByAdmissionDateDesc(patient.getId(), AdmissionStatus.REQUESTED)
                    .orElseGet(() -> {
                         // Fallback for direct admission (emergency walk-in)
                         return Admission.builder()
                                 .patient(patient)
                                 .admittingDoctor(currentUser) // If receptionist is admiting, we might need to handle who the admitting doctor is
                                 .admissionDate(LocalDateTime.now())
                                 .build();
                    });
        }

        Bed bed = bedRepository.findById(request.getBedId())
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));

        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new IllegalStateException("Bed is not available");
        }

        // Mark bed as occupied
        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);

        admission.setCurrentBed(bed);
        admission.setStatus(AdmissionStatus.ADMITTED);
        if (admission.getReasonForAdmission() == null) {
            admission.setReasonForAdmission(request.getReasonForAdmission());
        }
        if (admission.getAdmissionDate() == null) {
            admission.setAdmissionDate(LocalDateTime.now());
        }

        Admission savedAdmission = admissionRepository.save(admission);
        return mapToAdmissionDTO(savedAdmission);
    }

    @Transactional
    public AdmissionDTO transferPatient(User currentUser, UUID admissionId, TransferRequest request) {
        log.info("Transferring patient in admission {} to bed {}", admissionId, request.getNewBedId());
        
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        if (admission.getStatus() != AdmissionStatus.ADMITTED && admission.getStatus() != AdmissionStatus.UNDER_TREATMENT) {
            throw new IllegalStateException("Patient is not in a status that allows transfer");
        }

        Bed oldBed = admission.getCurrentBed();
        Bed newBed = bedRepository.findById(request.getNewBedId())
                .orElseThrow(() -> new IllegalArgumentException("New bed not found"));

        if (newBed.getStatus() != BedStatus.AVAILABLE) {
            throw new IllegalStateException("New bed is not available");
        }

        // Release old bed
        if (oldBed != null) {
            oldBed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(oldBed);
        }

        // Occupy new bed
        newBed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(newBed);

        admission.setCurrentBed(newBed);
        admission.setStatus(AdmissionStatus.TRANSFERRED); // Or keep as UNDER_TREATMENT, but user asked for TRANSFERRED status
        
        Admission savedAdmission = admissionRepository.save(admission);
        return mapToAdmissionDTO(savedAdmission);
    }

    @Transactional
    public AdmissionDTO requestDischarge(User currentUser, UUID admissionId) {
        log.info("Requesting discharge for admission {}", admissionId);
        
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        if (admission.getStatus() == AdmissionStatus.DISCHARGED) {
            throw new IllegalStateException("Patient is already discharged");
        }

        admission.setStatus(AdmissionStatus.DISCHARGE_REQUESTED);
        
        Admission savedAdmission = admissionRepository.save(admission);
        return mapToAdmissionDTO(savedAdmission);
    }

    @Transactional
    public AdmissionDTO finalizeDischarge(User currentUser, UUID admissionId) {
        log.info("Finalizing discharge for admission {}", admissionId);
        
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        if (admission.getStatus() == AdmissionStatus.DISCHARGED) {
            throw new IllegalStateException("Admission is already discharged");
        }

        admission.setStatus(AdmissionStatus.DISCHARGED);
        admission.setDischargeDate(LocalDateTime.now());

        Bed bed = admission.getCurrentBed();
        if (bed != null) {
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
            // We usually keep the reference to the last bed for history, but status is now DISCHARGED
        }

        Admission savedAdmission = admissionRepository.save(admission);
        return mapToAdmissionDTO(savedAdmission);
    }

    @Transactional
    public DailyRoundDTO addDailyRound(User currentUser, UUID admissionId, DailyRoundRequest request) {
        log.info("Adding daily round for admission {} by doctor {}", admissionId, currentUser.getId());
        
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        if (admission.getStatus() == AdmissionStatus.DISCHARGED) {
            throw new IllegalStateException("Cannot add daily round notes for a discharged admission");
        }

        DailyRound round = DailyRound.builder()
                .admission(admission)
                .doctor(currentUser)
                .roundDate(LocalDateTime.now())
                .clinicalNotes(request.getClinicalNotes())
                .temperature(request.getTemperature())
                .bloodPressure(request.getBloodPressure())
                .heartRate(request.getHeartRate())
                .medicationAdjustment(request.getMedicationAdjustment())
                .nextStep(request.getNextStep())
                .build();

        DailyRound savedRound = dailyRoundRepository.save(round);
        return mapToDailyRoundDTO(savedRound);
    }

    @Transactional
    public VitalsResponse recordVitals(User currentUser, UUID admissionId, VitalsRequest request) {
        log.info("Recording vitals for admission {} by {}", admissionId, currentUser.getName());
        
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        Vitals vitals = Vitals.builder()
                .patient(admission.getPatient())
                .admission(admission)
                .temperature(request.getTemperature())
                .bloodPressure(request.getBloodPressure())
                .heartRate(request.getHeartRate())
                .respiratoryRate(request.getRespiratoryRate())
                .oxygenSaturation(request.getOxygenSaturation())
                .weight(request.getWeight())
                .height(request.getHeight())
                .bmi(request.getBmi())
                .build();

        Vitals savedVitals = vitalsRepository.save(vitals);
        return mapToVitalsResponse(savedVitals);
    }

    @Transactional
    public EquipmentRequestDTO requestEquipment(User currentUser, UUID admissionId, EquipmentRequestAction request) {
        log.info("Requesting equipment {} for admission {}", request.getEquipmentType(), admissionId);
        
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        EquipmentRequest eqRequest = EquipmentRequest.builder()
                .admission(admission)
                .equipmentType(request.getEquipmentType())
                .priority(request.getPriority())
                .status("REQUESTED")
                .notes(request.getNotes())
                .build();

        EquipmentRequest saved = equipmentRequestRepository.save(eqRequest);
        return mapToEquipmentRequestDTO(saved);
    }

    @Transactional
    public EquipmentRequestDTO updateEquipmentStatus(User currentUser, UUID requestId, String status) {
        log.info("Updating equipment request {} to status {}", requestId, status);
        
        EquipmentRequest eqRequest = equipmentRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment request not found"));

        eqRequest.setStatus(status);
        if ("PROVIDED".equals(status)) {
            eqRequest.setProvidedAt(LocalDateTime.now());
        } else if ("RETURNED".equals(status)) {
            eqRequest.setReturnedAt(LocalDateTime.now());
        }

        EquipmentRequest saved = equipmentRequestRepository.save(eqRequest);
        return mapToEquipmentRequestDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<EquipmentRequestDTO> getEquipmentRequests(UUID admissionId) {
        return equipmentRequestRepository.findByAdmissionIdOrderByRequestedAtDesc(admissionId)
                .stream().map(this::mapToEquipmentRequestDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdmissionDTO> getAdmissionsByDoctor(UUID doctorId) {
        log.info("Fetching admissions for doctor {}", doctorId);
        return admissionRepository.findByAdmittingDoctorIdAndStatus(doctorId, AdmissionStatus.ADMITTED)
                .stream().map(this::mapToAdmissionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdmissionDTO> getActiveAdmissionsByBranch(UUID branchId) {
        log.info("Fetching active admissions for branch {}", branchId);
        List<AdmissionStatus> activeStatuses = List.of(
                AdmissionStatus.ADMITTED,
                AdmissionStatus.UNDER_TREATMENT,
                AdmissionStatus.TRANSFERRED,
                AdmissionStatus.DISCHARGE_REQUESTED
        );
        return admissionRepository.findByBranchIdAndStatuses(branchId, activeStatuses)
                .stream().map(this::mapToAdmissionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdmissionDTO> getActiveAdmissionsByWard(UUID wardId) {
        log.info("Fetching active admissions for ward {}", wardId);
        List<AdmissionStatus> activeStatuses = List.of(
                AdmissionStatus.ADMITTED,
                AdmissionStatus.UNDER_TREATMENT,
                AdmissionStatus.TRANSFERRED,
                AdmissionStatus.DISCHARGE_REQUESTED
        );
        return admissionRepository.findByWardIdAndStatuses(wardId, activeStatuses)
                .stream().map(this::mapToAdmissionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdmissionDTO> getAdmissionsByPatient(UUID patientId) {
        log.info("Fetching admissions history for patient {}", patientId);
        return admissionRepository.findByPatientIdOrderByAdmissionDateDesc(patientId)
                .stream().map(this::mapToAdmissionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DailyRoundDTO> getDailyRounds(UUID admissionId) {
        log.info("Fetching daily rounds for admission {}", admissionId);
        return dailyRoundRepository.findByAdmissionIdOrderByRoundDateAsc(admissionId)
                .stream().map(this::mapToDailyRoundDTO)
                .collect(Collectors.toList());
    }

    private AdmissionDTO mapToAdmissionDTO(Admission admission) {
        return AdmissionDTO.builder()
                .id(admission.getId())
                .patientId(admission.getPatient().getId())
                .patientName(admission.getPatient().getFirstName() + " " + admission.getPatient().getLastName())
                .admittingDoctorId(admission.getAdmittingDoctor().getId())
                .admittingDoctorName(admission.getAdmittingDoctor().getName())
                .currentBedId(admission.getCurrentBed() != null ? admission.getCurrentBed().getId() : null)
                .bedNumber(admission.getCurrentBed() != null ? admission.getCurrentBed().getBedNumber() : null)
                .wardName(admission.getCurrentBed() != null && admission.getCurrentBed().getWard() != null
                        ? admission.getCurrentBed().getWard().getName()
                        : null)
                .admissionDate(admission.getAdmissionDate())
                .dischargeDate(admission.getDischargeDate())
                .status(admission.getStatus())
                .reasonForAdmission(admission.getReasonForAdmission())
                .build();
    }

    private DailyRoundDTO mapToDailyRoundDTO(DailyRound round) {
        return DailyRoundDTO.builder()
                .id(round.getId())
                .admissionId(round.getAdmission().getId())
                .doctorId(round.getDoctor().getId())
                .doctorName(round.getDoctor().getName())
                .roundDate(round.getRoundDate())
                .clinicalNotes(round.getClinicalNotes())
                .temperature(round.getTemperature())
                .bloodPressure(round.getBloodPressure())
                .heartRate(round.getHeartRate())
                .medicationAdjustment(round.getMedicationAdjustment())
                .nextStep(round.getNextStep())
                .build();
    }

    private VitalsResponse mapToVitalsResponse(Vitals vitals) {
        return VitalsResponse.builder()
                .id(vitals.getId())
                .patientId(vitals.getPatient().getId())
                .bloodPressure(vitals.getBloodPressure())
                .temperature(vitals.getTemperature())
                .heartRate(vitals.getHeartRate())
                .respiratoryRate(vitals.getRespiratoryRate())
                .oxygenSaturation(vitals.getOxygenSaturation())
                .height(vitals.getHeight())
                .weight(vitals.getWeight())
                .bmi(vitals.getBmi())
                .recordedAt(vitals.getRecordedAt())
                .build();
    }

    private EquipmentRequestDTO mapToEquipmentRequestDTO(EquipmentRequest request) {
        return EquipmentRequestDTO.builder()
                .id(request.getId())
                .admissionId(request.getAdmission().getId())
                .equipmentType(request.getEquipmentType())
                .priority(request.getPriority())
                .status(request.getStatus())
                .notes(request.getNotes())
                .requestedAt(request.getRequestedAt())
                .providedAt(request.getProvidedAt())
                .returnedAt(request.getReturnedAt())
                .build();
    }

    @Transactional
    public MedicationAdministrationDTO recordMedicationAdministration(User currentUser, UUID admissionId, MedicationAdministrationRequest request) {
        log.info("Recording medication administration for admission {} by nurse {}", admissionId, currentUser.getId());
        
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));
        
        MedicationAdministration administration = MedicationAdministration.builder()
                .admission(admission)
                .medicineName(request.getMedicineName())
                .dosage(request.getDosage())
                .route(request.getRoute())
                .administeredBy(currentUser)
                .administeredAt(LocalDateTime.now())
                .notes(request.getNotes())
                .build();
        
        MedicationAdministration saved = medicationAdministrationRepository.save(administration);
        return mapToMedicationAdministrationDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicationAdministrationDTO> getMedicationHistory(UUID admissionId) {
        return medicationAdministrationRepository.findByAdmissionIdOrderByAdministeredAtDesc(admissionId)
                .stream().map(this::mapToMedicationAdministrationDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getActivePrescriptionsForAdmission(UUID admissionId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));
        
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(admission.getPatient().getId())
                .stream().map(this::mapToPrescriptionResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DischargeSummaryDTO getDischargeSummary(UUID admissionId) {
        log.info("Generating discharge summary for admission {}", admissionId);
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        List<VitalsResponse> vitals = vitalsRepository.findByAdmissionIdOrderByRecordedAtDesc(admissionId)
                .stream().map(this::mapToVitalsResponse).collect(Collectors.toList());

        List<MedicationAdministrationDTO> medicationHistory = getMedicationHistory(admissionId);
        List<PrescriptionResponse> prescriptions = getActivePrescriptionsForAdmission(admissionId);

        // Concatenate clinical notes for treatment summary
        String treatmentSummary = dailyRoundRepository.findByAdmissionIdOrderByRoundDateAsc(admissionId)
                .stream()
                .map(round -> round.getRoundDate().toLocalDate() + ": " + round.getClinicalNotes())
                .collect(Collectors.joining("\n"));

        return DischargeSummaryDTO.builder()
                .admissionId(admissionId)
                .patientName(admission.getPatient().getFirstName() + " " + admission.getPatient().getLastName())
                .patientGender(admission.getPatient().getGender())
                .admissionDate(admission.getAdmissionDate())
                .dischargeDate(admission.getDischargeDate())
                .doctorName(admission.getAdmittingDoctor().getName())
                .wardName(admission.getCurrentBed() != null && admission.getCurrentBed().getWard() != null 
                        ? admission.getCurrentBed().getWard().getName() : "N/A")
                .bedNumber(admission.getCurrentBed() != null ? admission.getCurrentBed().getBedNumber() : "N/A")
                .reasonForAdmission(admission.getReasonForAdmission())
                .treatmentSummary(treatmentSummary)
                .vitalsHistory(vitals)
                .medicationHistory(medicationHistory)
                .dischargePrescriptions(prescriptions)
                .build();
    }

    private MedicationAdministrationDTO mapToMedicationAdministrationDTO(MedicationAdministration ma) {
        return MedicationAdministrationDTO.builder()
                .id(ma.getId())
                .admissionId(ma.getAdmission().getId())
                .medicineName(ma.getMedicineName())
                .dosage(ma.getDosage())
                .route(ma.getRoute())
                .administeredById(ma.getAdministeredBy().getId())
                .administeredByName(ma.getAdministeredBy().getName())
                .administeredAt(ma.getAdministeredAt())
                .notes(ma.getNotes())
                .build();
    }

    private PrescriptionResponse mapToPrescriptionResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId())
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getFirstName() + " " + p.getPatient().getLastName())
                .doctorId(p.getDoctor().getId())
                .doctorName(p.getDoctor().getName())
                .medicineName(p.getMedicineName())
                .dosage(p.getDosage())
                .frequency(p.getFrequency())
                .duration(p.getDuration())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
