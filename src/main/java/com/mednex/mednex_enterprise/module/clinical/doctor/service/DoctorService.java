package com.mednex.mednex_enterprise.module.clinical.doctor.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentUpdateRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.DoctorDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.ClinicalNoteResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.CreateClinicalNoteRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.ClinicalNote;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.ClinicalNoteRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class DoctorService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ClinicalNoteRepository clinicalNoteRepository;

    public DoctorDashboardStatsDTO getDashboardStats(UUID doctorId) {
        // In a real application, total patients might be calculated uniquely.
        // For now, let's estimate based on appointment distinct patients or branch
        // patients.
        // As a placeholder, we use 0 or fetch all branch patients if needed.
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        long totalPatients = patientRepository.findByRegisteredBranchId(doctor.getPrimaryBranch().getId()).size();

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        long todayAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(doctorId, startOfDay, endOfDay)
                .size();

        long upcomingAppointments = appointmentRepository.countAppointmentsByDoctorAndStatus(doctorId,
                AppointmentStatus.SCHEDULED);

        return DoctorDashboardStatsDTO.builder()
                .totalPatients(totalPatients)
                .todayAppointments(todayAppointments)
                .upcomingAppointments(upcomingAppointments)
                .pendingPrescriptions(0) // future placeholder
                .build();
    }

    public List<AppointmentResponse> getAppointmentsByDateRange(UUID doctorId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startOfDay = LocalDateTime.of(startDate, LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(endDate, LocalTime.MAX);

        return appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(doctorId, startOfDay, endOfDay)
                .stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAllAppointments(UUID doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentTimeAsc(doctorId)
                .stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

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

    public List<Patient> getPatientsForDoctor(UUID doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return patientRepository.findByRegisteredBranchId(doctor.getPrimaryBranch().getId());
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

    public List<ClinicalNoteResponse> getClinicalNotesForPatient(UUID patientId) {
        return clinicalNoteRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToClinicalNoteResponse)
                .collect(Collectors.toList());
    }

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
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .reasonForVisit(appointment.getReasonForVisit())
                .notes(appointment.getNotes())
                .tokenNumber(appointment.getTokenNumber())
                .isWalkIn(appointment.getIsWalkIn())
                .build();
    }
}
