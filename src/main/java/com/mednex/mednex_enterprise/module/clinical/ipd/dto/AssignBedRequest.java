package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignBedRequest {
    @NotNull(message = "Bed ID is required")
    private UUID bedId;
}
