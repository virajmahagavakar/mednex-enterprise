package com.mednex.mednex_enterprise.module.pharmacy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePrescriptionItemRequest {
    @NotNull(message = "Medicine ID is required")
    private UUID medicineId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer prescribedQuantity;

    private String dosageInstructions;
}
