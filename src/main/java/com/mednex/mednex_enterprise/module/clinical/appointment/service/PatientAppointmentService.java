package com.mednex.mednex_enterprise.module.clinical.appointment.service;

import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.StaffProfileRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.AppointmentBookingRequest;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.AvailableSlotDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.DoctorInfoDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientAppointmentService {

    private final StaffProfileRepository staffProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public List<String> getAvailableSpecializations() {
        return staffProfileRepository.findDistinctDoctorSpecializations();
    }

    public List<DoctorInfoDTO> getDoctorsBySpecialization(String specialization) {
        List<User> doctors = staffProfileRepository.findDoctorsBySpecialization(specialization);
        return doctors.stream().map(doctor -> {
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

    public List<AvailableSlotDTO> getAvailableSlots(UUID doctorId, LocalDate date) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (!doctor.getRoles().stream().anyMatch(r -> r.getName().equals("DOCTOR"))) {
            throw new IllegalArgumentException("User is not a doctor");
        }

        // Generate slots from 9 AM to 5 PM every 30 minutes
        List<AvailableSlotDTO> slots = new ArrayList<>();
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(17, 0);

        LocalDateTime startOfDay = date.atTime(0, 0);
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
                        doctorId, startOfDay, endOfDay);

        while (startTime.isBefore(endTime)) {
            LocalDateTime slotTime = date.atTime(startTime);
            boolean isBooked = bookedAppointments.stream()
                    .anyMatch(app -> app.getAppointmentTime().equals(slotTime) &&
                            app.getStatus() != AppointmentStatus.CANCELLED);

            // Only add slots that are in the future if it's today
            if (slotTime.isAfter(LocalDateTime.now())) {
                slots.add(new AvailableSlotDTO(slotTime, !isBooked));
            }

            startTime = startTime.plusMinutes(30);
        }

        return slots;
    }

    @Transactional
    public void bookAppointment(User currentUser, AppointmentBookingRequest request) {
        Patient patient = patientRepository.findByUser(currentUser)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found."));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        // Check if slot is already booked
        LocalDateTime startOfDay = request.getAppointmentTime().toLocalDate().atTime(0, 0);
        LocalDateTime endOfDay = request.getAppointmentTime().toLocalDate().atTime(23, 59, 59);

        List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
                        doctor.getId(), startOfDay, endOfDay);

        boolean isSlotTaken = existingAppointments.stream()
                .anyMatch(app -> app.getAppointmentTime().equals(request.getAppointmentTime()) &&
                        app.getStatus() != AppointmentStatus.CANCELLED);

        if (isSlotTaken) {
            throw new IllegalStateException("The selected time slot is no longer available.");
        }

        Integer maxToken = appointmentRepository.findMaxTokenNumberByDoctorAndDate(doctor.getId(), startOfDay,
                endOfDay);
        int nextToken = (maxToken != null ? maxToken : 0) + 1;

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .branch(doctor.getPrimaryBranch() != null ? doctor.getPrimaryBranch() : patient.getRegisteredBranch())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.SCHEDULED)
                .reasonForVisit(request.getReasonForVisit())
                .tokenNumber(nextToken)
                .isWalkIn(false) // Online booked default
                .build();

        appointmentRepository.save(appointment);
    }
}
