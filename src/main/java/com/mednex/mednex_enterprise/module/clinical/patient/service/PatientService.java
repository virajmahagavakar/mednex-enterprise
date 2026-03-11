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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientAppointmentResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientProfileDTO;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientProfileUpdateDTO;
import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import com.mednex.mednex_enterprise.core.repository.StaffProfileRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final StaffProfileRepository staffProfileRepository;

    @Transactional
    public Patient getOrCreatePatient(User user) {
        return findPatient(user)
            .map(p -> {
                // If we found it by email but it wasn't linked to user, link it now
                if (p.getUser() == null) {
                    p.setUser(user);
                    return patientRepository.save(p);
                }
                return p;
            })
            .orElseGet(() -> {
                Patient newPatient = new Patient();
                newPatient.setUser(user);
                newPatient.setEmail(user.getEmail());
                newPatient.setFirstName(user.getName());
                newPatient.setLastName("");
                newPatient.setPhone("0000000000");
                newPatient.setRegisteredBranch(user.getPrimaryBranch());
                return patientRepository.save(newPatient);
            });
    }

    private Optional<Patient> findPatient(User user) {
        if (user == null) return Optional.empty();
        
        // 1. Try by user
        try {
            Optional<Patient> p = patientRepository.findByUser(user);
            if (p.isPresent()) return p;
        } catch (Exception e) {}

        // 2. Try by email as fallback
        try {
            return patientRepository.findByEmail(user.getEmail());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public PatientDashboardStatsDTO getDashboardStats(User loggedInUser) {
        try {
            Optional<Patient> patientOpt = findPatient(loggedInUser);

            if (patientOpt.isEmpty()) {
                return PatientDashboardStatsDTO.builder()
                        .upcomingAppointments(0)
                        .totalPrescriptions(0)
                        .unreadMessages(0)
                        .nextAppointmentDate(null)
                        .build();
            }

            Patient patient = patientOpt.get();
            List<Appointment> upcoming = appointmentRepository.findByPatientId(patient.getId()).stream()
                    .filter(a -> a.getAppointmentTime() != null && a.getAppointmentTime().isAfter(LocalDateTime.now()) &&
                            a.getStatus() != AppointmentStatus.CANCELLED &&
                            a.getStatus() != AppointmentStatus.COMPLETED)
                    .collect(Collectors.toList());

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
        } catch (Exception e) {
            e.printStackTrace();
            return PatientDashboardStatsDTO.builder()
                    .upcomingAppointments(0)
                    .totalPrescriptions(0)
                    .unreadMessages(0)
                    .nextAppointmentDate(null)
                    .build();
        }
    }

    public List<PatientAppointmentResponseDTO> getPatientAppointments(User loggedInUser) {
        try {
            Optional<Patient> patientOpt = findPatient(loggedInUser);

            if (patientOpt.isEmpty()) {
                return List.of();
            }

            Patient patient = patientOpt.get();
            List<Appointment> appointments = appointmentRepository
                    .findByPatientIdOrderByAppointmentTimeDesc(patient.getId());

            return appointments.stream().map(app -> {
                StaffProfile staffProfile = null;
                try {
                    if (app.getDoctor() != null) {
                        staffProfile = staffProfileRepository.findByUserId(app.getDoctor().getId()).orElse(null);
                    }
                } catch (Exception e) {
                    // Ignore staff profile error
                }
                
                return PatientAppointmentResponseDTO.builder()
                        .id(app.getId())
                        .doctorId(app.getDoctor() != null ? app.getDoctor().getId() : null)
                        .doctorName(app.getDoctor() != null ? app.getDoctor().getName() : null)
                        .specialization(staffProfile != null ? staffProfile.getSpecialization() : "Medical Professional")
                        .appointmentTime(app.getAppointmentTime())
                        .preferredDate(app.getPreferredDate())
                        .department(app.getDepartmentPreference())
                        .status(app.getStatus())
                        .reasonForVisit(app.getReasonForVisit())
                        .notes(app.getNotes())
                        .prescription(app.getPrescription())
                        .tokenNumber(app.getTokenNumber())
                        .isWalkIn(app.getIsWalkIn())
                        .build();
            }).collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public PatientProfileDTO getPatientProfile(User loggedInUser) {
        try {
            Optional<Patient> patientOpt = findPatient(loggedInUser);
            
            if (patientOpt.isEmpty()) {
                return PatientProfileDTO.builder()
                        .firstName(loggedInUser.getName())
                        .email(loggedInUser.getEmail())
                        .build();
            }

            Patient patient = patientOpt.get();
            LocalDate dob = parseLocalDate(patient.getDateOfBirth());

            return PatientProfileDTO.builder()
                    .firstName(patient.getFirstName())
                    .lastName(patient.getLastName())
                    .email(patient.getEmail())
                    .phone(patient.getPhone())
                    .dateOfBirth(dob)
                    .gender(patient.getGender())
                    .bloodGroup(patient.getBloodGroup())
                    .address(patient.getAddress())
                    .emergencyContactName(patient.getEmergencyContactName())
                    .emergencyContactPhone(patient.getEmergencyContactPhone())
                    .medicalHistory(patient.getMedicalHistory())
                    .build();
        } catch (Exception e) {
            return PatientProfileDTO.builder()
                    .firstName(loggedInUser.getName())
                    .email(loggedInUser.getEmail())
                    .build();
        }
    }

    @Transactional
    public void updatePatientProfile(User loggedInUser, PatientProfileUpdateDTO dto) {
        Patient patient = findPatient(loggedInUser)
            .orElseGet(() -> {
                Patient newPatient = new Patient();
                newPatient.setUser(loggedInUser);
                newPatient.setEmail(loggedInUser.getEmail());
                newPatient.setFirstName(loggedInUser.getName());
                newPatient.setLastName("");
                newPatient.setPhone("0000000000"); // Default phone if missing
                newPatient.setRegisteredBranch(loggedInUser.getPrimaryBranch());
                return newPatient;
            });
        if (dto.getDateOfBirth() != null)
            patient.setDateOfBirth(dto.getDateOfBirth().toString());
        if (dto.getGender() != null)
            patient.setGender(dto.getGender());
        if (dto.getBloodGroup() != null)
            patient.setBloodGroup(dto.getBloodGroup());
        if (dto.getAddress() != null)
            patient.setAddress(dto.getAddress());
        if (dto.getEmergencyContactName() != null)
            patient.setEmergencyContactName(dto.getEmergencyContactName());
        if (dto.getEmergencyContactPhone() != null)
            patient.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        if (dto.getMedicalHistory() != null)
            patient.setMedicalHistory(dto.getMedicalHistory());
        patientRepository.save(patient);
    }

    private LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            String cleanDate = dateStr.trim();
            if (cleanDate.length() > 10) {
                cleanDate = cleanDate.substring(0, 10);
            }
            return LocalDate.parse(cleanDate);
        } catch (Exception e) {
            return null;
        }
    }
}
