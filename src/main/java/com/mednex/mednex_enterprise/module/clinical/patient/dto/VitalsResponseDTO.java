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
public class VitalsResponseDTO {
    private UUID id;
    private String bloodPressure;
    private String heartRate;
    private String temperature;
    private String respiratoryRate;
    private String oxygenSaturation;
    private String height;
    private String weight;
    private String bmi;
    private LocalDateTime recordedAt;
}
