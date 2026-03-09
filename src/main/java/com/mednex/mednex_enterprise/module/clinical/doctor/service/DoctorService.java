package com.mednex.mednex_enterprise.module.clinical.doctor.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentUpdateRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.DoctorDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.PatientResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.ClinicalNoteResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.CreateClinicalNoteRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.ClinicalNote;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.ClinicalNoteRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.DashboardChartDataDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.AdmissionStatus;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.AdmissionRepository;
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
    public List<PatientResponse> getPatientsForDoctor(UUID doctorId) {
        log.info("Fetching patients for doctor {}", doctorId);
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        if (doctor.getPrimaryBranch() == null) {
            log.warn("Doctor {} has no primary branch assigned", doctorId);
            return List.of();
        }

        return patientRepository.findByRegisteredBranchId(doctor.getPrimaryBranch().getId())
                .stream()
                .map(this::mapToPatientResponse)
                .collect(Collectors.toList());
    }

    private PatientResponse mapToPatientResponse(Patient p) {
        return PatientResponse.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .dateOfBirth(p.getDateOfBirth() != null ? LocalDate.parse(p.getDateOfBirth()) : null)
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

    private ClinicalNoteResponse mapToClinicalNoteResponse(ClinicalNote note) {
        return ClinicalNoteResponse.builder()
                .id(note.getId())
                .patientId(note.getPatient().getId())
                .appointmentId(note.getAppointment().getId())
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
}
