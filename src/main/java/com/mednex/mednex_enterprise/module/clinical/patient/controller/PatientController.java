package com.mednex.mednex_enterprise.module.clinical.patient.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientAppointmentResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.patient.service.PatientService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientProfileDTO;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientProfileUpdateDTO;

@RestController
@RequestMapping("/api/v1/clinical/patient-portal")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<PatientDashboardStatsDTO> getDashboardStats(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(patientService.getDashboardStats(user));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<PatientAppointmentResponseDTO>> getPatientAppointments(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(patientService.getPatientAppointments(user));
    }

    @GetMapping("/profile")
    public ResponseEntity<PatientProfileDTO> getPatientProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(patientService.getPatientProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<Void> updatePatientProfile(@RequestBody PatientProfileUpdateDTO request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        patientService.updatePatientProfile(user, request);
        return ResponseEntity.ok().build();
    }
}
