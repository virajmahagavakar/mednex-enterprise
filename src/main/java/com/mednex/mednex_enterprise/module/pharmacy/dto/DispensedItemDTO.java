package com.mednex.mednex_enterprise.module.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DispensedItemDTO {
    private UUID id;
    private UUID medicineId;
    private String medicineName;
    private UUID inventoryBatchId;
    private String batchNumber;
    private Integer prescribedQuantity;
    private Integer dispensedQuantity;
    private String dosageInstructions;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal discountPercent;
}
