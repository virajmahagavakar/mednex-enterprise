package com.mednex.mednex_enterprise.module.pharmacy.controller;

import com.mednex.mednex_enterprise.module.pharmacy.dto.DispenseRequest;
import com.mednex.mednex_enterprise.module.pharmacy.dto.PharmacyDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.PharmacyPrescriptionDTO;
import com.mednex.mednex_enterprise.module.pharmacy.service.PharmacyDispensingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PHARMACIST')")
public class PharmacyDispensingController {

    private final PharmacyDispensingService dispensingService;

    @GetMapping("/dashboard")
    public ResponseEntity<PharmacyDashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(dispensingService.getDashboardStats());
    }

    @GetMapping("/dispense/pending-prescriptions")
    public ResponseEntity<List<PharmacyPrescriptionDTO>> getPendingPrescriptions() {
        return ResponseEntity.ok(dispensingService.getPendingPrescriptions());
    }

    @PostMapping("/dispense/prescriptions/{prescriptionId}/fulfill")
    public ResponseEntity<PharmacyPrescriptionDTO> fulfillPrescription(
            @PathVariable UUID prescriptionId,
            @RequestBody DispenseRequest request) {
        return ResponseEntity.ok(dispensingService.fulfillPrescription(prescriptionId, request));
    }
}
