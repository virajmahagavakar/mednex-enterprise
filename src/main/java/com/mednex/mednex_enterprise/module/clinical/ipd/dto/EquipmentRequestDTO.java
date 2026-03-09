package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentRequestDTO {
    private UUID id;
    private UUID admissionId;
    private String equipmentType;
    private String priority;
    private String status;
    private String notes;
    private LocalDateTime requestedAt;
    private LocalDateTime providedAt;
    private LocalDateTime returnedAt;
}
