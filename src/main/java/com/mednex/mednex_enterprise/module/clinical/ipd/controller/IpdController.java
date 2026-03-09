package com.mednex.mednex_enterprise.module.clinical.ipd.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.*;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.VitalsRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.VitalsResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.PrescriptionResponse;
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

    @PostMapping("/admissions/request")
    public ResponseEntity<AdmissionDTO> requestAdmission(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AdmissionRequestDTO request) {
        return ResponseEntity.ok(ipdService.requestAdmission(currentUser, request));
    }

    @GetMapping("/admissions/pending")
    public ResponseEntity<List<AdmissionDTO>> getPendingAdmissions() {
        return ResponseEntity.ok(ipdService.getPendingAdmissions());
    }

    @PatchMapping("/admissions/{id}/assign-bed")
    public ResponseEntity<AdmissionDTO> assignBed(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody AssignBedRequest request) {
        AdmissionRequest admissionRequest = AdmissionRequest.builder()
                .patientId(id)
                .bedId(request.getBedId())
                .build();
        return ResponseEntity.ok(ipdService.admitPatient(currentUser, admissionRequest));
    }

    @PostMapping("/admissions")
    public ResponseEntity<AdmissionDTO> admitPatient(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AdmissionRequest request) {
        return ResponseEntity.ok(ipdService.admitPatient(currentUser, request));
    }

    @PatchMapping("/admissions/{id}/transfer")
    public ResponseEntity<AdmissionDTO> transferPatient(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(ipdService.transferPatient(currentUser, id, request));
    }

    @PatchMapping("/admissions/{id}/request-discharge")
    public ResponseEntity<AdmissionDTO> requestDischarge(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.requestDischarge(currentUser, id));
    }

    @PostMapping("/admissions/{id}/discharge")
    public ResponseEntity<AdmissionDTO> dischargePatient(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.finalizeDischarge(currentUser, id));
    }

    @PostMapping("/admissions/{id}/rounds")
    public ResponseEntity<DailyRoundDTO> addDailyRound(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody DailyRoundRequest request) {
        return ResponseEntity.ok(ipdService.addDailyRound(currentUser, id, request));
    }

    @PostMapping("/admissions/{id}/vitals")
    public ResponseEntity<VitalsResponse> recordVitals(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody VitalsRequest request) {
        return ResponseEntity.ok(ipdService.recordVitals(currentUser, id, request));
    }

    @GetMapping("/admissions/me")
    public ResponseEntity<List<AdmissionDTO>> getAdmissionsByDoctor(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ipdService.getAdmissionsByDoctor(currentUser.getId()));
    }

    @GetMapping("/patients/{patientId}/admissions")
    public ResponseEntity<List<AdmissionDTO>> getAdmissionsByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ipdService.getAdmissionsByPatient(patientId));
    }

    @GetMapping("/admissions/active/branch")
    public ResponseEntity<List<AdmissionDTO>> getActiveAdmissionsByBranch(@RequestParam UUID branchId) {
        return ResponseEntity.ok(ipdService.getActiveAdmissionsByBranch(branchId));
    }

    @GetMapping("/admissions/active/ward")
    public ResponseEntity<List<AdmissionDTO>> getActiveAdmissionsByWard(@RequestParam UUID wardId) {
        return ResponseEntity.ok(ipdService.getActiveAdmissionsByWard(wardId));
    }

    @GetMapping("/admissions/{id}/rounds")
    public ResponseEntity<List<DailyRoundDTO>> getDailyRounds(@PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.getDailyRounds(id));
    }

    @PostMapping("/admissions/{id}/equipment")
    public ResponseEntity<EquipmentRequestDTO> requestEquipment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody EquipmentRequestAction request) {
        return ResponseEntity.ok(ipdService.requestEquipment(currentUser, id, request));
    }

    @PatchMapping("/equipment/{requestId}/status")
    public ResponseEntity<EquipmentRequestDTO> updateEquipmentStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID requestId,
            @RequestParam String status) {
        return ResponseEntity.ok(ipdService.updateEquipmentStatus(currentUser, requestId, status));
    }

    @GetMapping("/admissions/{id}/equipment")
    public ResponseEntity<List<EquipmentRequestDTO>> getEquipmentRequests(@PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.getEquipmentRequests(id));
    }

    @GetMapping("/admissions/{id}/prescriptions")
    public ResponseEntity<List<PrescriptionResponse>> getActivePrescriptionsForAdmission(@PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.getActivePrescriptionsForAdmission(id));
    }

    @PostMapping("/admissions/{id}/medication")
    public ResponseEntity<MedicationAdministrationDTO> recordMedicationAdministration(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody MedicationAdministrationRequest request) {
        return ResponseEntity.ok(ipdService.recordMedicationAdministration(currentUser, id, request));
    }

    @GetMapping("/admissions/{id}/medication-history")
    public ResponseEntity<List<MedicationAdministrationDTO>> getMedicationHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(ipdService.getMedicationHistory(id));
    }
}
