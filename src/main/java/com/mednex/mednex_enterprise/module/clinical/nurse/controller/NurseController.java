package com.mednex.mednex_enterprise.module.clinical.nurse.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentResponse;
import com.mednex.mednex_enterprise.module.clinical.nurse.dto.NurseDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.clinical.nurse.dto.TriageRequest;
import com.mednex.mednex_enterprise.module.clinical.nurse.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clinical/nurses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NURSE')")
public class NurseController {

    private final NurseService nurseService;

    @GetMapping("/dashboard")
    public ResponseEntity<NurseDashboardStatsDTO> getDashboardStats(@AuthenticationPrincipal User nurse) {
        return ResponseEntity.ok(nurseService.getDashboardStats(nurse.getId()));
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<List<AppointmentResponse>> getTodayAppointments(@AuthenticationPrincipal User nurse) {
        return ResponseEntity.ok(nurseService.getTodayAppointmentsForBranch(nurse.getId()));
    }

    @PostMapping("/appointments/{id}/triage")
    public ResponseEntity<AppointmentResponse> performTriage(
            @AuthenticationPrincipal User nurse,
            @PathVariable UUID id,
            @RequestBody TriageRequest request) {
        return ResponseEntity.ok(nurseService.performTriage(nurse.getId(), id, request));
    }
}
