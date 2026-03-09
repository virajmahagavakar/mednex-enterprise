package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalsRequest {
    private String bloodPressure;
    private String temperature;
    private String heartRate;
    private String oxygenSaturation;
    private String height;
    private String weight;
    private String respiratoryRate;
    private String bmi;
}
