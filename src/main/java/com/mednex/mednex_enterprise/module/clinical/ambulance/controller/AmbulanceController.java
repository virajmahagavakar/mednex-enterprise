package com.mednex.mednex_enterprise.module.clinical.ambulance.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ambulance.dto.AmbulanceRequestDTO;
import com.mednex.mednex_enterprise.module.clinical.ambulance.dto.AmbulanceResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.ambulance.service.AmbulanceService;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AmbulanceController {

    private final AmbulanceService ambulanceService;
    private final UserRepository userRepository;

    @PostMapping("/patient/ambulance/request")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AmbulanceResponseDTO> createRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AmbulanceRequestDTO dto) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ambulanceService.createRequest(user, dto));
    }

    @GetMapping("/patient/ambulance/my-requests")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AmbulanceResponseDTO>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ambulanceService.getPatientRequests(user));
    }

    @GetMapping("/receptionist/ambulance/requests")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<AmbulanceResponseDTO>> getActiveRequests() {
        return ResponseEntity.ok(ambulanceService.getActiveRequests());
    }

    @PatchMapping("/receptionist/ambulance/{id}/dispatch")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN')")
    public ResponseEntity<AmbulanceResponseDTO> dispatchAmbulance(@PathVariable UUID id) {
        return ResponseEntity.ok(ambulanceService.dispatchAmbulance(id));
    }

    @PatchMapping("/receptionist/ambulance/{id}/complete")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN')")
    public ResponseEntity<AmbulanceResponseDTO> completeRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(ambulanceService.completeRequest(id));
    }
}
