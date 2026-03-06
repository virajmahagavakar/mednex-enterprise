package com.mednex.mednex_enterprise.module.pharmacy.dto;

import com.mednex.mednex_enterprise.module.pharmacy.entity.InventoryBatch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryBatchDTO {
    private UUID id;
    private UUID medicineId;
    private String medicineName;
    private UUID supplierId;
    private String supplierName;
    private String batchNumber;
    private Integer quantityAvailable;
    private LocalDate expiryDate;
    private BigDecimal unitSellingPrice;
    private InventoryBatch.BatchStatus status;
}
