package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientSummaryDTO {
    private UUID id;
    private String name;
    private Integer age;
    private String gender;
    private String contactNumber;
    private String lastVisitDate;
    private String patientType; // OPD or IPD
    private String currentStatus;
}
