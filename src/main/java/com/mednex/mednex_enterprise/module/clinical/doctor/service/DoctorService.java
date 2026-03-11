package com.mednex.mednex_enterprise.module.clinical.doctor.service;

import com.mednex.mednex_enterprise.module.clinical.doctor.dto.*;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.*;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Admission;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.AdmissionStatus;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.AdmissionRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.core.entity.User;
import org.springframework.data.domain.PageRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ClinicalNoteRepository clinicalNoteRepository;
    private final AdmissionRepository admissionRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final LabTestRequestRepository labTestRequestRepository;

    @Transactional(readOnly = true)
    public DoctorDashboardStatsDTO getDashboardStats(UUID doctorId) {
        log.info("Fetching production-grade dashboard stats for doctor {}", doctorId);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.with(LocalTime.MIN);
        LocalDateTime endOfDay = now.with(LocalTime.MAX);

        long totalPatients = appointmentRepository.countDistinctPatientIdByDoctorId(doctorId);
        long todayAppointments = appointmentRepository.countByDoctorIdAndStatusAndAppointmentTimeBetween(
                doctorId, AppointmentStatus.SCHEDULED, startOfDay, endOfDay) + 
                appointmentRepository.countByDoctorIdAndStatusAndAppointmentTimeBetween(
                doctorId, AppointmentStatus.CHECKED_IN, startOfDay, endOfDay) +
                appointmentRepository.countByDoctorIdAndStatusAndAppointmentTimeBetween(
                doctorId, AppointmentStatus.IN_PROGRESS, startOfDay, endOfDay) +
                appointmentRepository.countByDoctorIdAndStatusAndAppointmentTimeBetween(
                doctorId, AppointmentStatus.COMPLETED, startOfDay, endOfDay);

        long waitingQueueCount = appointmentRepository.countByDoctorIdAndStatusAndAppointmentTimeBetween(
                doctorId, AppointmentStatus.CHECKED_IN, startOfDay, endOfDay);

        long completedToday = appointmentRepository.countByDoctorIdAndStatusAndAppointmentTimeBetween(
                doctorId, AppointmentStatus.COMPLETED, startOfDay, endOfDay);

        long activeIpdPatients = admissionRepository.countByAdmittingDoctorIdAndStatus(
                doctorId, AdmissionStatus.ADMITTED);

        // Find next appointment time
        List<Appointment> nextApts = appointmentRepository.findNextAppointments(
                doctorId, AppointmentStatus.SCHEDULED, now, PageRequest.of(0, 1));
        
        String nextAppointmentTime = nextApts.isEmpty() ? "None" : 
                nextApts.get(0).getAppointmentTime().toLocalTime().toString().substring(0, 5);

        return DoctorDashboardStatsDTO.builder()
                .totalPatients(totalPatients)
                .todayAppointments(todayAppointments)
                .waitingQueueCount(waitingQueueCount)
                .completedToday(completedToday)
                .activeIpdPatients(activeIpdPatients)
                .nextAppointmentTime(nextAppointmentTime)
                .pendingPrescriptions(0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DashboardChartDataDTO> getDetailedStats(UUID doctorId) {
        log.info("Fetching workload trends for doctor {}", doctorId);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);
        LocalDateTime start = end.minusDays(7).with(LocalTime.MIN);

        List<Object[]> results = appointmentRepository.findDailyConsultationsCount(doctorId, start, end);
        
        return results.stream().map(result -> DashboardChartDataDTO.builder()
                .date(result[0].toString())
                .patientsSeen((Long) result[1])
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getTodayAppointments(UUID doctorId) {
        LocalDateTime start = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);
        return appointmentRepository.findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(doctorId, start, end)
                .stream().map(this::mapToAppointmentResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getWaitingQueue(UUID doctorId) {
        return appointmentRepository.findQueueByDoctorAndStatus(doctorId, AppointmentStatus.CHECKED_IN, 
                org.springframework.data.domain.PageRequest.of(0, 5))
                .stream().map(this::mapToAppointmentResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDateRange(UUID doctorId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startOfDay = LocalDateTime.of(startDate, LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(endDate, LocalTime.MAX);

        return appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(doctorId, startOfDay, endOfDay)
                .stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments(UUID doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentTimeAsc(doctorId)
                .stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentDetails(UUID doctorId, UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(a -> a.getDoctor().getId().equals(doctorId))
                .orElseThrow(() -> new RuntimeException("Appointment not found or not authorized"));
        return mapToAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(UUID doctorId, UUID appointmentId, AppointmentUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(a -> a.getDoctor().getId().equals(doctorId))
                .orElseThrow(() -> new RuntimeException("Appointment not found or not authorized"));

        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }
        if (request.getPrescription() != null) {
            appointment.setPrescription(request.getPrescription());
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentResponse(updatedAppointment);
    }

    @Transactional(readOnly = true)
    public List<PatientSummaryDTO> getPatientsForDoctor(UUID doctorId) {
        log.info("Fetching production-grade summary list for doctor {}", doctorId);
        
        List<Patient> assignedPatients = patientRepository.findAssignedPatients(doctorId);
        
        return assignedPatients.stream()
                .map(p -> mapToPatientSummaryDTO(p, doctorId))
                .collect(Collectors.toList());
    }

    private PatientSummaryDTO mapToPatientSummaryDTO(Patient p, UUID doctorId) {
        // Find if they are currently an IPD patient under this doctor
        boolean isIpd = admissionRepository.findTopByPatientIdAndStatusOrderByAdmissionDateDesc(
                p.getId(), AdmissionStatus.ADMITTED)
                .map(a -> a.getAdmittingDoctor().getId().equals(doctorId))
                .orElse(false);

        // Calculate age
        Integer age = null;
        LocalDate dob = parseLocalDate(p.getDateOfBirth());
        if (dob != null) {
            age = java.time.Period.between(dob, LocalDate.now()).getYears();
        }

        return PatientSummaryDTO.builder()
                .id(p.getId())
                .name(p.getFirstName() + " " + p.getLastName())
                .age(age)
                .gender(p.getGender())
                .contactNumber(p.getPhone())
                .patientType(isIpd ? "IPD" : "OPD")
                .lastVisitDate(p.getUpdatedAt() != null ? p.getUpdatedAt().toLocalDate().toString() : "Never")
                .currentStatus(isIpd ? "ADMITTED" : "FOLLOW_UP") // Default for now
                .build();
    }

    private PatientResponse mapToPatientResponse(Patient p) {
        return PatientResponse.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .dateOfBirth(parseLocalDate(p.getDateOfBirth()))
                .gender(p.getGender())
                .bloodGroup(p.getBloodGroup())
                .medicalHistory(p.getMedicalHistory())
                .build();
    }

    @Transactional
    public ClinicalNoteResponse createClinicalNote(UUID doctorId, UUID appointmentId,
            CreateClinicalNoteRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(a -> a.getDoctor().getId().equals(doctorId))
                .orElseThrow(() -> new RuntimeException("Appointment not found or not authorized"));

        ClinicalNote note = ClinicalNote.builder()
                .patient(appointment.getPatient())
                .appointment(appointment)
                .doctor(appointment.getDoctor())
                .subjective(request.getSubjective())
                .objective(request.getObjective())
                .assessment(request.getAssessment())
                .plan(request.getPlan())
                .followUpDate(request.getFollowUpDate())
                .build();

        ClinicalNote savedNote = clinicalNoteRepository.save(note);
        return mapToClinicalNoteResponse(savedNote);
    }

    @Transactional(readOnly = true)
    public List<ClinicalNoteResponse> getClinicalNotesForPatient(UUID patientId) {
        return clinicalNoteRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToClinicalNoteResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClinicalNoteResponse> getClinicalNotesForPatientAsDoctor(UUID doctorId, UUID patientId) {
        // Here we could add a check if the doctor is authorized to view this patient's
        // records
        return getClinicalNotesForPatient(patientId);
    }

    @Transactional(readOnly = true)
    public PatientEMRResponse getPatientFullEMR(UUID doctorId, UUID patientId) {
        log.info("Fetching production-grade full EMR for patient {} by doctor {}", patientId, doctorId);
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        List<ClinicalNote> notes = clinicalNoteRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        List<Vitals> vitals = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
        List<LabTestRequest> labRequests = labTestRequestRepository.findByPatientIdOrderByRequestedAtDesc(patientId);
        List<Admission> admissions = admissionRepository.findByPatientIdOrderByAdmissionDateDesc(patientId);

        return PatientEMRResponse.builder()
                .patientDetails(mapToPatientResponse(patient))
                .clinicalNotes(notes.stream().map(this::mapToClinicalNoteResponse).collect(Collectors.toList()))
                .prescriptions(prescriptions.stream().map(this::mapToPrescriptionResponse).collect(Collectors.toList()))
                .vitalsHistory(vitals.stream().map(this::mapToVitalsResponse).collect(Collectors.toList()))
                .labReports(labRequests.stream().map(this::mapToLabTestRequestResponse).collect(Collectors.toList()))
                .admissionHistory(admissions.stream().map(this::mapToAdmissionSummaryDTO).collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public PrescriptionResponse createPrescription(UUID doctorId, UUID patientId, CreatePrescriptionRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Prescription prescription = Prescription.builder()
                .patient(patient)
                .doctor(doctor)
                .medicineName(request.getMedicineName())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .duration(request.getDuration())
                .build();

        return mapToPrescriptionResponse(prescriptionRepository.save(prescription));
    }

    @Transactional
    public VitalsResponse recordVitals(UUID patientId, VitalsRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Vitals vitals = Vitals.builder()
                .patient(patient)
                .bloodPressure(request.getBloodPressure())
                .temperature(request.getTemperature())
                .heartRate(request.getHeartRate())
                .oxygenSaturation(request.getOxygenSaturation())
                .height(request.getHeight())
                .weight(request.getWeight())
                .build();

        return mapToVitalsResponse(vitalsRepository.save(vitals));
    }

    @Transactional
    public LabTestRequestResponse requestLabTest(UUID doctorId, UUID patientId, CreateLabTestRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        LabTestRequest labRequest = LabTestRequest.builder()
                .patient(patient)
                .doctor(doctor)
                .testType(request.getTestType())
                .priority(request.getPriority())
                .notes(request.getNotes())
                .build();

        return mapToLabTestRequestResponse(labTestRequestRepository.save(labRequest));
    }

    private PrescriptionResponse mapToPrescriptionResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId())
                .medicineName(p.getMedicineName())
                .dosage(p.getDosage())
                .frequency(p.getFrequency())
                .duration(p.getDuration())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private VitalsResponse mapToVitalsResponse(Vitals v) {
        return VitalsResponse.builder()
                .id(v.getId())
                .bloodPressure(v.getBloodPressure())
                .temperature(v.getTemperature())
                .heartRate(v.getHeartRate())
                .oxygenSaturation(v.getOxygenSaturation())
                .height(v.getHeight())
                .weight(v.getWeight())
                .recordedAt(v.getRecordedAt())
                .build();
    }

    private LabTestRequestResponse mapToLabTestRequestResponse(LabTestRequest l) {
        return LabTestRequestResponse.builder()
                .id(l.getId())
                .testType(l.getTestType())
                .priority(l.getPriority())
                .notes(l.getNotes())
                .status(l.getStatus())
                .requestedAt(l.getRequestedAt())
                .build();
    }

    private AdmissionSummaryDTO mapToAdmissionSummaryDTO(Admission a) {
        return AdmissionSummaryDTO.builder()
                .id(a.getId())
                .admissionDate(a.getAdmissionDate())
                .dischargeDate(a.getDischargeDate())
                .status(a.getStatus().name())
                .wardName(a.getCurrentBed() != null ? a.getCurrentBed().getWard().getName() : "N/A")
                .bedNumber(a.getCurrentBed() != null ? a.getCurrentBed().getBedNumber() : "N/A")
                .build();
    }

    private ClinicalNoteResponse mapToClinicalNoteResponse(ClinicalNote note) {
        return ClinicalNoteResponse.builder()
                .id(note.getId())
                .patientId(note.getPatient().getId())
                .appointmentId(note.getAppointment() != null ? note.getAppointment().getId() : null)
                .doctorId(note.getDoctor().getId())
                .doctorName(note.getDoctor().getName())
                .subjective(note.getSubjective())
                .objective(note.getObjective())
                .assessment(note.getAssessment())
                .plan(note.getPlan())
                .followUpDate(note.getFollowUpDate())
                .createdAt(note.getCreatedAt())
                .build();
    }

    private AppointmentResponse mapToAppointmentResponse(Appointment appointment) {
        if (appointment == null) return null;
        
        String patientName = "Unknown Patient";
        UUID patientId = null;
        
        if (appointment.getPatient() != null) {
            patientId = appointment.getPatient().getId();
            String firstName = appointment.getPatient().getFirstName() != null ? appointment.getPatient().getFirstName() : "";
            String lastName = appointment.getPatient().getLastName() != null ? appointment.getPatient().getLastName() : "";
            patientName = (firstName + " " + lastName).trim();
            if (patientName.isEmpty()) patientName = "Unnamed Patient";
        } else {
            log.error("Appointment {} has no patient linked!", appointment.getId());
        }

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(patientId)
                .patientName(patientName)
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .reasonForVisit(appointment.getReasonForVisit())
                .notes(appointment.getNotes())
                .tokenNumber(appointment.getTokenNumber())
                .isWalkIn(appointment.getIsWalkIn())
                .build();
    }

    private LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            String cleanDate = dateStr.trim();
            // Handle formats like "YYYY-MM-DD +05:30" by taking the first 10 characters
            if (cleanDate.length() > 10) {
                cleanDate = cleanDate.substring(0, 10);
            }
            return LocalDate.parse(cleanDate);
        } catch (Exception e) {
            log.warn("Failed to parse date string: '{}'", dateStr);
            return null;
        }
    }
}
