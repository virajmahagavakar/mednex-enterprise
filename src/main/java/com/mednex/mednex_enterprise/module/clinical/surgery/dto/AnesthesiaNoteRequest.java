package com.mednex.mednex_enterprise.module.clinical.surgery.dto;

import lombok.Data;

@Data
public class AnesthesiaNoteRequest {
    private String anesthesiaType;
    private String medicationsAdministered;
    private String patientVitalsSummary;
    private String anesthetistNotes;
}
