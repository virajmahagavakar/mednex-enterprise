package com.mednex.mednex_enterprise.module.clinical.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestRequestResponseDTO {
    private UUID id;
    private String testType;
    private String priority;
    private String notes;
    private String status;
    private LocalDateTime requestedAt;
}
