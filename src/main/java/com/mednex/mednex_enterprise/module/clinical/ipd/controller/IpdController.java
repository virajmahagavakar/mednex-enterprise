package com.mednex.mednex_enterprise.module.clinical.ipd.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.service.IpdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clinical/ipd")
@RequiredArgsConstructor
public class IpdController {

    private final IpdService ipdService;

    @GetMapping("/wards")
    public ResponseEntity<List<WardDTO>> getWardsByBranch(@RequestParam UUID branchId) {
        return ResponseEntity.ok(ipdService.getWardsByBranch(branchId));
    }

    @GetMapping("/wards/{wardId}/beds")
    public ResponseEntity<List<BedDTO>> getBedsByWard(@PathVariable UUID wardId) {
        return ResponseEntity.ok(ipdService.getBedsByWard(wardId));
    }

    @PostMapping("/admissions")
    public ResponseEntity<AdmissionDTO> admitPatient(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AdmissionRequest request) {
        return ResponseEntity.ok(ipdService.admitPatient(currentUser, request));
    }

    @PostMapping("/admissions/{id}/discharge")
    public ResponseEntity<AdmissionDTO> dischargePatient(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.dischargePatient(currentUser, id));
    }

    @PostMapping("/admissions/{id}/rounds")
    public ResponseEntity<DailyRoundDTO> addDailyRound(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody DailyRoundRequest request) {
        return ResponseEntity.ok(ipdService.addDailyRound(currentUser, id, request));
    }

    @GetMapping("/admissions/me")
    public ResponseEntity<List<AdmissionDTO>> getAdmissionsByDoctor(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ipdService.getAdmissionsByDoctor(currentUser.getId()));
    }

    @GetMapping("/patients/{patientId}/admissions")
    public ResponseEntity<List<AdmissionDTO>> getAdmissionsByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ipdService.getAdmissionsByPatient(patientId));
    }

    @GetMapping("/admissions/{id}/rounds")
    public ResponseEntity<List<DailyRoundDTO>> getDailyRounds(@PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.getDailyRounds(id));
    }
}
