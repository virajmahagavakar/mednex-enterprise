package com.mednex.mednex_enterprise.module.pharmacy.controller;

import com.mednex.mednex_enterprise.module.pharmacy.dto.BatchReceiptRequest;
import com.mednex.mednex_enterprise.module.pharmacy.dto.InventoryBatchDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.MedicineDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.SupplierDTO;
import com.mednex.mednex_enterprise.module.pharmacy.service.PharmacyInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pharmacy/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PHARMACIST')")
public class PharmacyInventoryController {

    private final PharmacyInventoryService inventoryService;

    // --- MEDICINES ---

    @GetMapping("/medicines")
    public ResponseEntity<List<MedicineDTO>> getAllMedicines() {
        return ResponseEntity.ok(inventoryService.getAllMedicines());
    }

    @PostMapping("/medicines")
    public ResponseEntity<MedicineDTO> addMedicine(@RequestBody MedicineDTO dto) {
        return ResponseEntity.ok(inventoryService.addMedicine(dto));
    }

    @GetMapping("/medicines/low-stock")
    public ResponseEntity<List<MedicineDTO>> getLowStockMedicines() {
        return ResponseEntity.ok(inventoryService.getLowStockMedicines());
    }

    // --- SUPPLIERS ---

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        return ResponseEntity.ok(inventoryService.getAllSuppliers());
    }

    @PostMapping("/suppliers")
    public ResponseEntity<SupplierDTO> addSupplier(@RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(inventoryService.addSupplier(dto));
    }

    // --- BATCHES & STOCK ---

    @PostMapping("/receive-stock")
    public ResponseEntity<InventoryBatchDTO> receiveStock(@RequestBody BatchReceiptRequest request) {
        return ResponseEntity.ok(inventoryService.receiveStock(request));
    }

    @GetMapping("/medicines/{medicineId}/batches")
    public ResponseEntity<List<InventoryBatchDTO>> getActiveBatches(@PathVariable UUID medicineId) {
        return ResponseEntity.ok(inventoryService.getActiveBatchesForMedicine(medicineId));
    }

    @GetMapping("/batches/expiring-soon")
    public ResponseEntity<List<InventoryBatchDTO>> getExpiringSoonBatches(
            @RequestParam(defaultValue = "30") int daysThreshold) {
        return ResponseEntity.ok(inventoryService.getExpiringSoonBatches(daysThreshold));
    }
}
