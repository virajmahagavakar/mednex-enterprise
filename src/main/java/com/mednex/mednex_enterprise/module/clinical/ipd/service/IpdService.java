package com.mednex.mednex_enterprise.module.clinical.ipd.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.AdmissionRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.BedRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.DailyRoundRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.WardRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
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
                .wardId(bed.getWard().getId())
                .roomNumber(bed.getRoomNumber())
                .bedNumber(bed.getBedNumber())
                .status(bed.getStatus())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public AdmissionDTO admitPatient(User currentUser, AdmissionRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        Bed bed = bedRepository.findById(request.getBedId())
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));

        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new IllegalStateException("Bed is not available");
        }

        // Verify if patient is already admitted
        if (admissionRepository
                .findTopByPatientIdAndStatusOrderByAdmissionDateDesc(patient.getId(), AdmissionStatus.ADMITTED)
                .isPresent()) {
            throw new IllegalStateException("Patient is already admitted");
        }

        // Mark bed as occupied
        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);

        Admission admission = Admission.builder()
                .patient(patient)
                .admittingDoctor(currentUser)
                .currentBed(bed)
                .admissionDate(LocalDateTime.now())
                .status(AdmissionStatus.ADMITTED)
                .reasonForAdmission(request.getReasonForAdmission())
                .build();

        Admission savedAdmission = admissionRepository.save(admission);
        return mapToAdmissionDTO(savedAdmission);
    }

    @Transactional
    public AdmissionDTO dischargePatient(User currentUser, UUID admissionId) {
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
            admission.setCurrentBed(null); // Release bed link, or keep it for history based on design. Let's keep it to
                                           // know the last bed.
        }

        Admission savedAdmission = admissionRepository.save(admission);
        return mapToAdmissionDTO(savedAdmission);
    }

    @Transactional
    public DailyRoundDTO addDailyRound(User currentUser, UUID admissionId, DailyRoundRequest request) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found"));

        if (admission.getStatus() != AdmissionStatus.ADMITTED) {
            throw new IllegalStateException("Cannot add daily round notes for a discharged admission");
        }

        DailyRound round = DailyRound.builder()
                .admission(admission)
                .doctor(currentUser)
                .roundDate(LocalDateTime.now())
                .clinicalNotes(request.getClinicalNotes())
                .build();

        DailyRound savedRound = dailyRoundRepository.save(round);
        return DailyRoundDTO.builder()
                .id(savedRound.getId())
                .admissionId(admission.getId())
                .doctorId(savedRound.getDoctor().getId())
                .doctorName(savedRound.getDoctor().getName())
                .roundDate(savedRound.getRoundDate())
                .clinicalNotes(savedRound.getClinicalNotes())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdmissionDTO> getAdmissionsByDoctor(UUID doctorId) {
        log.info("Fetching admissions for doctor {}", doctorId);
        return admissionRepository.findByAdmittingDoctorIdAndStatus(doctorId, AdmissionStatus.ADMITTED)
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
                .stream().map(round -> DailyRoundDTO.builder()
                        .id(round.getId())
                        .admissionId(round.getAdmission().getId())
                        .doctorId(round.getDoctor().getId())
                        .doctorName(round.getDoctor().getName())
                        .roundDate(round.getRoundDate())
                        .clinicalNotes(round.getClinicalNotes())
                        .build())
                .collect(Collectors.toList());
    }

    private AdmissionDTO mapToAdmissionDTO(Admission admission) {
        return AdmissionDTO.builder()
                .id(admission.getId())
                .patientId(admission.getPatient().getId())
                .patientName(admission.getPatient().getUser().getName())
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
}
