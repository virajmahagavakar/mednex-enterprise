package com.mednex.mednex_enterprise.module.clinical.appointment.service;

import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.TriageRequestDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceptionistAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final TriageEngineService triageEngineService;

    public List<Appointment> getRequestedAppointments() {
        return appointmentRepository.findByStatus(AppointmentStatus.REQUESTED);
    }

    public List<Appointment> getPendingAppointments() {
        return appointmentRepository.findByStatusInOrderByAppointmentTimeAsc(
                List.of(AppointmentStatus.REQUESTED, AppointmentStatus.TRIAGED, AppointmentStatus.PENDING));
    }

    public List<Appointment> getTodayAppointments() {
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return appointmentRepository.findByAppointmentTimeBetweenOrderByAppointmentTimeAsc(start, end);
    }

    @Transactional
    public Appointment triageAppointment(UUID appointmentId, TriageRequestDTO triageRequest) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        // Use Triage Engine if no specific urgency provided
        if (triageRequest.getUrgencyLevel() == null) {
            TriageEngineService.TriageSuggestion suggestion = triageEngineService.suggest(appointment.getSymptoms());
            appointment.setUrgencyLevel(suggestion.getUrgency());
            if (appointment.getDepartmentPreference() == null) {
                appointment.setDepartmentPreference(suggestion.getDepartment());
            }
        } else {
            appointment.setUrgencyLevel(triageRequest.getUrgencyLevel());
        }

        if (triageRequest.getDoctorId() != null) {
            assignDoctor(appointment, triageRequest.getDoctorId());
        }
        
        if (triageRequest.getAppointmentTime() != null) {
            scheduleSlot(appointment, triageRequest.getAppointmentTime());
        }
        
        // Transition state based on what's assigned
        if (appointment.getDoctor() != null && appointment.getAppointmentTime() != null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        } else {
            appointment.setStatus(AppointmentStatus.TRIAGED);
        }
        
        if (triageRequest.getNotes() != null) {
            appointment.setNotes(triageRequest.getNotes());
        }
        
        return appointmentRepository.save(appointment);
    }

    private void assignDoctor(Appointment appointment, UUID doctorId) {
        appointment.setDoctor(userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found")));
    }

    private void scheduleSlot(Appointment appointment, LocalDateTime time) {
        if (appointment.getDoctor() == null) {
            throw new IllegalStateException("Cannot schedule slot without an assigned doctor");
        }
        
        if (appointmentRepository.existsByDoctorIdAndAppointmentTime(appointment.getDoctor().getId(), time)) {
            throw new RuntimeException("Slot already booked for this doctor at " + time);
        }
        
        appointment.setAppointmentTime(time);
    }

    private UrgencyLevel triageUrgencyOrDefault(UrgencyLevel level) {
        return level != null ? level : UrgencyLevel.ROUTINE;
    }

    @Transactional
    public Appointment checkInPatient(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment cancelAppointment(UUID appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setNotes(reason);
        return appointmentRepository.save(appointment);
    }
}
