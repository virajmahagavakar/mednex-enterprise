package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import com.mednex.mednex_enterprise.module.clinical.doctor.entity.LabTestRequest.LabRequestStatus;
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
public class LabTestRequestResponse {
    private UUID id;
    private String testType;
    private String priority;
    private String notes;
    private LabRequestStatus status;
    private LocalDateTime requestedAt;
}
