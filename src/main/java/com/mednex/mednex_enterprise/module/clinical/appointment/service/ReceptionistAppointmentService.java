package com.mednex.mednex_enterprise.module.clinical.appointment.service;

import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.DoctorInfoDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.TriageRequestDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import com.mednex.mednex_enterprise.core.repository.StaffProfileRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.AppointmentResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.PatientResponseDTO;

@Service
@RequiredArgsConstructor
public class ReceptionistAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final TriageEngineService triageEngineService;

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getRequestedAppointments() {
        return appointmentRepository.findByStatusWithPatient(AppointmentStatus.REQUESTED).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPendingAppointments() {
        return appointmentRepository.findByStatusInOrderByAppointmentTimeAsc(
                List.of(AppointmentStatus.REQUESTED, AppointmentStatus.TRIAGED, AppointmentStatus.PENDING,
                        AppointmentStatus.DENIED, AppointmentStatus.TRANSFERRED))
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getTodayAppointments() {
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return appointmentRepository.findByAppointmentTimeBetweenOrderByAppointmentTimeAsc(start, end).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponseDTO triageAppointment(UUID appointmentId, TriageRequestDTO triageRequest) {
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

        return mapToResponseDTO(appointmentRepository.save(appointment));
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
    public AppointmentResponseDTO checkInPatient(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        return mapToResponseDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponseDTO cancelAppointment(UUID appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setNotes(reason);
        return mapToResponseDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponseDTO approveAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return mapToResponseDTO(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<DoctorInfoDTO> getDoctors() {
        return userRepository.findAllByRolesName("DOCTOR").stream()
                .filter(User::isActive)
                .map(doctor -> {
                    StaffProfile profile = staffProfileRepository.findByUserId(doctor.getId()).orElse(null);
                    return DoctorInfoDTO.builder()
                            .id(doctor.getId())
                            .name(doctor.getName())
                            .specialization(profile != null ? profile.getSpecialization() : "General")
                            .qualification(profile != null ? profile.getQualification() : "")
                            .yearsOfExperience(profile != null ? profile.getYearsOfExperience() : 0)
                            .defaultConsultationFee(profile != null ? profile.getDefaultConsultationFee() : null)
                            .build();
                }).collect(Collectors.toList());
    }

    private AppointmentResponseDTO mapToResponseDTO(Appointment entity) {
        if (entity == null)
            return null;

        return AppointmentResponseDTO.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .urgencyLevel(entity.getUrgencyLevel())
                .appointmentTime(entity.getAppointmentTime())
                .tokenNumber(entity.getTokenNumber())
                .isWalkIn(entity.getIsWalkIn())
                .reasonForVisit(entity.getReasonForVisit())
                .symptoms(entity.getSymptoms())
                .problemDescription(entity.getProblemDescription())
                .departmentPreference(entity.getDepartmentPreference())
                .preferredDate(entity.getPreferredDate())
                .notes(entity.getNotes())
                .prescription(entity.getPrescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .patient(mapPatientToDTO(entity.getPatient()))
                .doctor(mapDoctorToDTO(entity.getDoctor()))
                .build();
    }

    private PatientResponseDTO mapPatientToDTO(
            com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient patient) {
        if (patient == null)
            return null;
        return PatientResponseDTO.builder()
                .id(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .email(patient.getEmail())
                .phone(patient.getPhone())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .build();
    }

    private DoctorInfoDTO mapDoctorToDTO(User doctor) {
        if (doctor == null)
            return null;
        StaffProfile profile = staffProfileRepository.findByUserId(doctor.getId()).orElse(null);
        return DoctorInfoDTO.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .specialization(profile != null ? profile.getSpecialization() : "General")
                .qualification(profile != null ? profile.getQualification() : "")
                .yearsOfExperience(profile != null ? profile.getYearsOfExperience() : 0)
                .defaultConsultationFee(profile != null ? profile.getDefaultConsultationFee() : null)
                .build();
    }
}
