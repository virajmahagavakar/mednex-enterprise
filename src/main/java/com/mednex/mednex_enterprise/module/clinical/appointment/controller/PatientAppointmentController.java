package com.mednex.mednex_enterprise.module.clinical.appointment.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.AppointmentRequestDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.AvailableSlotDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.DoctorInfoDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.service.PatientAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clinical/appointments/wizard")
@RequiredArgsConstructor
public class PatientAppointmentController {

    private final PatientAppointmentService appointmentService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getSpecializations() {
        return ResponseEntity.ok(appointmentService.getAvailableSpecializations());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorInfoDTO>> getDoctorsBySpecialization(@RequestParam String specialization) {
        return ResponseEntity.ok(appointmentService.getDoctorsBySpecialization(specialization));
    }

    @GetMapping("/doctors/{doctorId}/slots")
    public ResponseEntity<List<AvailableSlotDTO>> getAvailableSlots(
            @PathVariable UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorId, date));
    }

    @PostMapping("/request")
    public ResponseEntity<String> requestAppointment(Authentication authentication,
            @RequestBody AppointmentRequestDTO request) {
        User user = getAuthenticatedUser(authentication);
        appointmentService.requestAppointment(user, request);
        return ResponseEntity.ok("Appointment request submitted successfully.");
    }
}
