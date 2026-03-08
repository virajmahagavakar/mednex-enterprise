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

    public List<Appointment> getRequestedAppointments() {
        return appointmentRepository.findByStatusInOrderByAppointmentTimeAsc(
                List.of(AppointmentStatus.REQUESTED, AppointmentStatus.PENDING));
    }

    public List<Appointment> getAllAppointmentsForToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return appointmentRepository.findByAppointmentTimeBetweenOrderByAppointmentTimeAsc(startOfDay, endOfDay);
    }

    @Transactional
    public Appointment approveAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment checkInPatient(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment triageAppointment(UUID appointmentId, TriageRequestDTO triageRequest) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        if (triageRequest.getDoctorId() != null) {
            appointment.setDoctor(userRepository.findById(triageRequest.getDoctorId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found")));
        }
        
        appointment.setUrgencyLevel(triageUrgencyOrDefault(triageRequest.getUrgencyLevel()));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        
        if (triageRequest.getNotes() != null) {
            appointment.setNotes(triageRequest.getNotes());
        }
        
        return appointmentRepository.save(appointment);
    }

    private UrgencyLevel triageUrgencyOrDefault(UrgencyLevel level) {
        return level != null ? level : UrgencyLevel.ROUTINE;
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
