package com.mednex.mednex_enterprise.module.pharmacy.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.pharmacy.dto.CreatePrescriptionRequest;
import com.mednex.mednex_enterprise.module.pharmacy.dto.MedicineDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.PharmacyPrescriptionDTO;
import com.mednex.mednex_enterprise.module.pharmacy.service.PharmacyDispensingService;
import com.mednex.mednex_enterprise.module.pharmacy.service.PharmacyInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy/clinical")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class PharmacyClinicalController {

    private final PharmacyDispensingService dispensingService;
    private final PharmacyInventoryService inventoryService;

    @GetMapping("/medicines")
    public ResponseEntity<List<MedicineDTO>> getAllMedicines() {
        return ResponseEntity.ok(inventoryService.getAllMedicines());
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<PharmacyPrescriptionDTO> createPrescription(
            @AuthenticationPrincipal User doctor,
            @Valid @RequestBody CreatePrescriptionRequest request) {
        return ResponseEntity.ok(dispensingService.createPrescription(doctor.getId(), request));
    }
}
