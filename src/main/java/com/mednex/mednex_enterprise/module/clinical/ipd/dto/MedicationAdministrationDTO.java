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
public class MedicationAdministrationDTO {
    private UUID id;
    private UUID admissionId;
    private String medicineName;
    private String dosage;
    private String route;
    private UUID administeredById;
    private String administeredByName;
    private LocalDateTime administeredAt;
    private String notes;
}
