package com.mednex.mednex_enterprise.module.clinical.patient.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientAppointmentResponseDTO;
import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import com.mednex.mednex_enterprise.core.repository.StaffProfileRepository;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final StaffProfileRepository staffProfileRepository;

    public Patient getPatientByEmail(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for email: " + email));
    }

    public PatientDashboardStatsDTO getDashboardStats(User loggedInUser) {
        Patient patient = getPatientByEmail(loggedInUser.getEmail());

        List<Appointment> upcoming = appointmentRepository.findByPatientId(patient.getId()).stream()
                .filter(a -> a.getAppointmentTime().isAfter(LocalDateTime.now()) &&
                        a.getStatus() != AppointmentStatus.CANCELLED &&
                        a.getStatus() != AppointmentStatus.COMPLETED)
                .toList();

        String nextApptDate = null;
        if (!upcoming.isEmpty()) {
            upcoming.sort((a1, a2) -> a1.getAppointmentTime().compareTo(a2.getAppointmentTime()));
            nextApptDate = upcoming.get(0).getAppointmentTime().toString();
        }

        return PatientDashboardStatsDTO.builder()
                .upcomingAppointments(upcoming.size())
                .totalPrescriptions(0) // Placeholder
                .unreadMessages(0) // Placeholder
                .nextAppointmentDate(nextApptDate)
                .build();
    }

    public List<PatientAppointmentResponseDTO> getPatientAppointments(User loggedInUser) {
        Patient patient = getPatientByEmail(loggedInUser.getEmail());

        List<Appointment> appointments = appointmentRepository
                .findByPatientIdOrderByAppointmentTimeDesc(patient.getId());

        return appointments.stream().map(app -> {
            StaffProfile staffProfile = staffProfileRepository.findByUserId(app.getDoctor().getId()).orElse(null);
            return PatientAppointmentResponseDTO.builder()
                    .id(app.getId())
                    .doctorId(app.getDoctor().getId())
                    .doctorName(app.getDoctor().getName())
                    .specialization(staffProfile != null ? staffProfile.getSpecialization() : "General")
                    .appointmentTime(app.getAppointmentTime())
                    .status(app.getStatus())
                    .reasonForVisit(app.getReasonForVisit())
                    .notes(app.getNotes())
                    .prescription(app.getPrescription())
                    .build();
        }).collect(Collectors.toList());
    }
}
