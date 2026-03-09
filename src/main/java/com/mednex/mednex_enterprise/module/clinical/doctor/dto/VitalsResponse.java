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
public class VitalsResponse {
    private UUID id;
    private UUID patientId;
    private String bloodPressure;
    private String temperature;
    private String heartRate;
    private String respiratoryRate;
    private String oxygenSaturation;
    private String height;
    private String weight;
    private String bmi;
    private LocalDateTime recordedAt;
}
