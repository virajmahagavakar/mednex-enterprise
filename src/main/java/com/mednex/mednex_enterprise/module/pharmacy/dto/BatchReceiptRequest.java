package com.mednex.mednex_enterprise.module.pharmacy.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class BatchReceiptRequest {
    private UUID medicineId;
    private UUID supplierId;
    private String batchNumber;
    private Integer quantityReceived;
    private LocalDate manufacturingDate; // Optional
    private LocalDate expiryDate;
    private BigDecimal unitCostPrice;
    private BigDecimal unitSellingPrice;
}
