package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

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
public class AdmissionSummaryDTO {
    private UUID id;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private String status;
    private String wardName;
    private String bedNumber;
}
