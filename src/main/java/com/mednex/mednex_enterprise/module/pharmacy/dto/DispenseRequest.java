package com.mednex.mednex_enterprise.module.pharmacy.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.mednex.mednex_enterprise.module.pharmacy.entity.PharmacyPrescription;

@Data
public class DispenseRequest {
    private List<DispenseItemRequest> items;
    private PharmacyPrescription.PaymentStatus paymentStatus; // e.g., PAID immediately over counter

    @Data
    public static class DispenseItemRequest {
        private UUID dispensedItemId; // Which item in the prescription we are fulfilling
        private UUID inventoryBatchId; // From which batch
        private Integer quantityToDispense; // How much we are giving now (for partial dispensing)
        private BigDecimal discountPercent; // Optional discount explicitly given at counter
    }
}
