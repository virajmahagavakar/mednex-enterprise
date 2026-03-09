package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRoundRequest {
    @NotBlank(message = "Clinical notes are required")
    private String clinicalNotes;
    private String temperature;
    private String bloodPressure;
    private String heartRate;
    private String medicationAdjustment;
    private String nextStep;
}
