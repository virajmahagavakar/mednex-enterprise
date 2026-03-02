package com.mednex.mednex_enterprise.module.clinical.nurse.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentResponse;
import com.mednex.mednex_enterprise.module.clinical.nurse.dto.NurseDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.clinical.nurse.dto.TriageRequest;
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
public class NurseService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public NurseDashboardStatsDTO getDashboardStats(UUID nurseId) {
        User nurse = userRepository.findById(nurseId)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));

        UUID branchId = nurse.getPrimaryBranch().getId();

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        // Find all appointments for the branch today
        List<Appointment> branchAppointmentsToday = appointmentRepository.findByBranchId(branchId)
                .stream()
                .filter(a -> a.getAppointmentTime().isAfter(startOfDay) && a.getAppointmentTime().isBefore(endOfDay))
                .collect(Collectors.toList());

        long todayAppointments = branchAppointmentsToday.size();

        // Waiting room = SCHEDULED state for today
        long waitingRoomCount = branchAppointmentsToday.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED)
                .count();

        // Triaged = IN_PROGRESS state for today
        long triagedToday = branchAppointmentsToday.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS)
                .count();

        return NurseDashboardStatsDTO.builder()
                .todayAppointments(todayAppointments)
                .waitingRoomCount(waitingRoomCount)
                .triagedToday(triagedToday)
                .criticalCases(0) // Placeholder
                .build();
    }

    // Fetches all branch appointments for today so the nurse can manage triage
    public List<AppointmentResponse> getTodayAppointmentsForBranch(UUID nurseId) {
        User nurse = userRepository.findById(nurseId)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));

        UUID branchId = nurse.getPrimaryBranch().getId();
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        return appointmentRepository.findByBranchId(branchId).stream()
                .filter(a -> a.getAppointmentTime().isAfter(startOfDay) && a.getAppointmentTime().isBefore(endOfDay))
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse performTriage(UUID nurseId, UUID appointmentId, TriageRequest request) {
        // Here we could verify that the nurse belongs to the same branch as the
        // appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Format triage data into the notes field for now
        StringBuilder updatedNotes = new StringBuilder();
        if (appointment.getNotes() != null) {
            updatedNotes.append(appointment.getNotes()).append("\n\n");
        }

        updatedNotes.append("--- Triage Update ---\n");
        if (request.getVitalsSnapshot() != null) {
            updatedNotes.append("Vitals: ").append(request.getVitalsSnapshot()).append("\n");
        }
        if (request.getInitialNotes() != null) {
            updatedNotes.append("Complaint: ").append(request.getInitialNotes()).append("\n");
        }

        appointment.setNotes(updatedNotes.toString());

        if (request.isMarkAsReady()) {
            appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentResponse(savedAppointment);
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
                .build();
    }
}
