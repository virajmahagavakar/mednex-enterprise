package com.mednex.mednex_enterprise.module.clinical.appointment.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.ClinicalNote;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.LabTestRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.Prescription;
import com.mednex.mednex_enterprise.module.clinical.doctor.entity.Vitals;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.ClinicalNoteRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.LabTestRequestRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.PrescriptionRepository;
import com.mednex.mednex_enterprise.module.clinical.doctor.repository.VitalsRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.*;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorConsultationService {

        private final AppointmentRepository appointmentRepository;
        private final UserRepository userRepository;
        private final ClinicalNoteRepository clinicalNoteRepository;
        private final PrescriptionRepository prescriptionRepository;
        private final LabTestRequestRepository labTestRequestRepository;
        private final VitalsRepository vitalsRepository;
        private final PatientRepository patientRepository;

        @Transactional
        public PatientAppointmentResponseDTO denyAppointment(User doctor, UUID appointmentId, String reason) {
                Appointment appointment = appointmentRepository.findById(appointmentId)
                                .orElseThrow(() -> new RuntimeException("Appointment not found"));

                if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                        throw new RuntimeException("Unauthorized: You are not assigned to this appointment.");
                }

                appointment.setStatus(AppointmentStatus.DENIED);
                appointment.setNotes((appointment.getNotes() == null ? "" : appointment.getNotes() + "\n") +
                                "Denied by Dr. " + doctor.getName() + " on " + LocalDateTime.now() + ". Reason: " +
                                (reason != null ? reason : "Not provided"));

                // By removing the doctor assignment, we push it back to the receptionist's
                // unassigned queue
                appointment.setDoctor(null);

                appointment = appointmentRepository.save(appointment);
                return mapToDTO(appointment);
        }

        @Transactional
        public PatientAppointmentResponseDTO transferAppointment(User doctor, UUID appointmentId, String newDepartment,
                        UUID newDoctorId, String reason) {
                Appointment appointment = appointmentRepository.findById(appointmentId)
                                .orElseThrow(() -> new RuntimeException("Appointment not found"));

                if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                        throw new RuntimeException("Unauthorized: You are not assigned to this appointment.");
                }

                User newDoctor = null;
                if (newDoctorId != null) {
                        newDoctor = userRepository.findById(newDoctorId)
                                        .orElseThrow(() -> new RuntimeException("New Doctor not found"));
                }

                appointment.setStatus(AppointmentStatus.TRANSFERRED);
                appointment.setNotes((appointment.getNotes() == null ? "" : appointment.getNotes() + "\n") +
                                "Transferred by Dr. " + doctor.getName() + " on " + LocalDateTime.now() + ". Reason: " +
                                (reason != null ? reason : "Not provided"));

                appointment.setDepartmentPreference(newDepartment);
                appointment.setDoctor(newDoctor); // Might be null if just sending to department

                appointment = appointmentRepository.save(appointment);
                return mapToDTO(appointment);
        }

        @Transactional(readOnly = true)
        public PatientEMRResponseDTO getPatientFullEMR(UUID patientId) {
                Patient patient = patientRepository.findById(patientId)
                                .orElseThrow(() -> new RuntimeException("Patient not found"));

                PatientProfileDTO profile = mapToPatientProfileDTO(patient);

                List<ClinicalNoteResponseDTO> notes = clinicalNoteRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                                .stream().map(this::mapToClinicalNoteDTO).collect(Collectors.toList());

                List<PrescriptionResponseDTO> prescriptions = prescriptionRepository
                                .findByPatientIdOrderByCreatedAtDesc(patientId)
                                .stream().map(this::mapToPrescriptionDTO).collect(Collectors.toList());

                List<LabTestRequestResponseDTO> labReports = labTestRequestRepository
                                .findByPatientIdOrderByRequestedAtDesc(patientId)
                                .stream().map(this::mapToLabTestDTO).collect(Collectors.toList());

                List<VitalsResponseDTO> vitals = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                                .stream().map(this::mapToVitalsDTO).collect(Collectors.toList());

                return PatientEMRResponseDTO.builder()
                                .patientDetails(profile)
                                .clinicalNotes(notes)
                                .prescriptions(prescriptions)
                                .labReports(labReports)
                                .vitalsHistory(vitals)
                                .build();
        }

        private PatientProfileDTO mapToPatientProfileDTO(Patient p) {
                LocalDate dob = parseLocalDate(p.getDateOfBirth());
                return PatientProfileDTO.builder()
                                .firstName(p.getFirstName())
                                .lastName(p.getLastName())
                                .email(p.getEmail())
                                .phone(p.getPhone())
                                .dateOfBirth(dob)
                                .gender(p.getGender())
                                .bloodGroup(p.getBloodGroup())
                                .address(p.getAddress())
                                .medicalHistory(p.getMedicalHistory())
                                .build();
        }

        private ClinicalNoteResponseDTO mapToClinicalNoteDTO(ClinicalNote n) {
                return ClinicalNoteResponseDTO.builder()
                                .id(n.getId())
                                .patientId(n.getPatient().getId())
                                .appointmentId(n.getAppointment().getId())
                                .subjective(n.getSubjective())
                                .objective(n.getObjective())
                                .assessment(n.getAssessment())
                                .plan(n.getPlan())
                                .doctorName(n.getDoctor().getName())
                                .createdAt(n.getCreatedAt())
                                .build();
        }

        private PrescriptionResponseDTO mapToPrescriptionDTO(Prescription p) {
                return PrescriptionResponseDTO.builder()
                                .id(p.getId())
                                .medicineName(p.getMedicineName())
                                .dosage(p.getDosage())
                                .frequency(p.getFrequency())
                                .duration(p.getDuration())
                                .doctorName(p.getDoctor().getName())
                                .createdAt(p.getCreatedAt())
                                .build();
        }

        private LabTestRequestResponseDTO mapToLabTestDTO(LabTestRequest l) {
                return LabTestRequestResponseDTO.builder()
                                .id(l.getId())
                                .testType(l.getTestType())
                                .priority(l.getPriority())
                                .notes(l.getNotes())
                                .status(l.getStatus() != null ? l.getStatus().name() : null)
                                .requestedAt(l.getRequestedAt())
                                .build();
        }

        private VitalsResponseDTO mapToVitalsDTO(Vitals v) {
                return VitalsResponseDTO.builder()
                                .id(v.getId())
                                .bloodPressure(v.getBloodPressure())
                                .heartRate(v.getHeartRate())
                                .temperature(v.getTemperature())
                                .respiratoryRate(v.getRespiratoryRate())
                                .oxygenSaturation(v.getOxygenSaturation())
                                .height(v.getHeight())
                                .weight(v.getWeight())
                                .bmi(v.getBmi())
                                .recordedAt(v.getRecordedAt())
                                .build();
        }
        private PatientAppointmentResponseDTO mapToDTO(Appointment a) {
                return PatientAppointmentResponseDTO.builder()
                                .id(a.getId())
                                .appointmentTime(a.getAppointmentTime() != null ? a.getAppointmentTime()
                                                : (a.getPreferredDate() != null ? a.getPreferredDate()
                                                                : null))
                                .status(a.getStatus())
                                .department(a.getDepartmentPreference())
                                .notes(a.getNotes())
                                .doctorName(a.getDoctor() != null ? a.getDoctor().getName() : null)
                                .build();
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
