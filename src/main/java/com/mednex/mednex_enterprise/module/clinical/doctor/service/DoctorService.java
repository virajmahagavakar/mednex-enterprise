package com.mednex.mednex_enterprise.module.clinical.doctor.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentUpdateRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.DoctorDashboardStatsDTO;
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
