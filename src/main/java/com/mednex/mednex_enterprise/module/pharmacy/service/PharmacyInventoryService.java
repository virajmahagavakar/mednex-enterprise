package com.mednex.mednex_enterprise.module.pharmacy.service;

import com.mednex.mednex_enterprise.module.pharmacy.dto.BatchReceiptRequest;
import com.mednex.mednex_enterprise.module.pharmacy.dto.InventoryBatchDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.MedicineDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.SupplierDTO;
import com.mednex.mednex_enterprise.module.pharmacy.entity.InventoryBatch;
import com.mednex.mednex_enterprise.module.pharmacy.entity.Medicine;
import com.mednex.mednex_enterprise.module.pharmacy.entity.Supplier;
import com.mednex.mednex_enterprise.module.pharmacy.exception.PharmacyServiceException;
import com.mednex.mednex_enterprise.module.pharmacy.repository.InventoryBatchRepository;
import com.mednex.mednex_enterprise.module.pharmacy.repository.MedicineRepository;
import com.mednex.mednex_enterprise.module.pharmacy.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyInventoryService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryBatchRepository batchRepository;

    // --- MEDICINE CATALOG ---

    @Transactional
    public MedicineDTO addMedicine(MedicineDTO dto) {
        if (medicineRepository.existsByName(dto.getName())) {
            throw new PharmacyServiceException("Medicine with this name already exists");
        }
        Medicine medicine = Medicine.builder()
                .name(dto.getName())
                .genericName(dto.getGenericName())
                .category(dto.getCategory())
                .manufacturer(dto.getManufacturer())
                .unit(dto.getUnit())
                .minimumStockLevel(dto.getMinimumStockLevel() != null ? dto.getMinimumStockLevel() : 10)
                .requiresPrescription(dto.getRequiresPrescription() != null ? dto.getRequiresPrescription() : true)
                .isActive(true)
                .build();
        return mapToDto(medicineRepository.save(medicine));
    }

    @Transactional(readOnly = true)
    public List<MedicineDTO> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // --- SUPPLIERS ---

    @Transactional
    public SupplierDTO addSupplier(SupplierDTO dto) {
        if (supplierRepository.existsByName(dto.getName())) {
            throw new PharmacyServiceException("Supplier with this name already exists");
        }
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .isActive(true)
                .build();
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // --- INVENTORY MANAGEMENT ---

    @Transactional
    public InventoryBatchDTO receiveStock(BatchReceiptRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new PharmacyServiceException("Medicine not found"));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new PharmacyServiceException("Supplier not found"));

        if (request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new PharmacyServiceException("Cannot receive expired stock");
        }

        InventoryBatch batch = InventoryBatch.builder()
                .medicine(medicine)
                .supplier(supplier)
                .batchNumber(request.getBatchNumber())
                .quantityTotal(request.getQuantityReceived())
                .quantityAvailable(request.getQuantityReceived())
                .manufacturingDate(request.getManufacturingDate())
                .expiryDate(request.getExpiryDate())
                .unitCostPrice(request.getUnitCostPrice())
                .unitSellingPrice(request.getUnitSellingPrice())
                .status(InventoryBatch.BatchStatus.ACTIVE)
                .build();

        return mapToDto(batchRepository.save(batch));
    }

    @Transactional(readOnly = true)
    public List<InventoryBatchDTO> getActiveBatchesForMedicine(UUID medicineId) {
        return batchRepository
                .findByMedicineIdAndStatusOrderByExpiryDateAsc(medicineId, InventoryBatch.BatchStatus.ACTIVE)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryBatchDTO> getExpiringSoonBatches(int daysThreshold) {
        LocalDate alertDate = LocalDate.now().plusDays(daysThreshold);
        return batchRepository.findExpiringSoonBatches(alertDate)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineDTO> getLowStockMedicines() {
        // Find distinct medicines from the batch query
        List<InventoryBatch> lowStockBatches = batchRepository.findLowStockMedicines();
        return lowStockBatches.stream()
                .map(InventoryBatch::getMedicine)
                .distinct()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // --- MAPPERS ---

    private MedicineDTO mapToDto(Medicine entity) {
        Integer currentStock = batchRepository.getTotalAvailableQuantityByMedicine(entity.getId());
        return MedicineDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .genericName(entity.getGenericName())
                .category(entity.getCategory())
                .manufacturer(entity.getManufacturer())
                .unit(entity.getUnit())
                .minimumStockLevel(entity.getMinimumStockLevel())
                .requiresPrescription(entity.getRequiresPrescription())
                .isActive(entity.getIsActive())
                .currentStock(currentStock != null ? currentStock : 0)
                .build();
    }

    private SupplierDTO mapToDto(Supplier entity) {
        return SupplierDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .contactPerson(entity.getContactPerson())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .isActive(entity.getIsActive())
                .build();
    }

    private InventoryBatchDTO mapToDto(InventoryBatch entity) {
        return InventoryBatchDTO.builder()
                .id(entity.getId())
                .medicineId(entity.getMedicine().getId())
                .medicineName(entity.getMedicine().getName())
                .supplierId(entity.getSupplier().getId())
                .supplierName(entity.getSupplier().getName())
                .batchNumber(entity.getBatchNumber())
                .quantityAvailable(entity.getQuantityAvailable())
                .expiryDate(entity.getExpiryDate())
                .unitSellingPrice(entity.getUnitSellingPrice())
                .status(entity.getStatus())
                .build();
    }
}
