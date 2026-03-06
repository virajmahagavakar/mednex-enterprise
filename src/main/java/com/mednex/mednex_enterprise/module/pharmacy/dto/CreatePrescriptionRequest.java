package com.mednex.mednex_enterprise.module.pharmacy.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreatePrescriptionRequest {
    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private UUID appointmentId;

    @NotEmpty(message = "At least one medicine must be prescribed")
    private List<CreatePrescriptionItemRequest> items;
}
