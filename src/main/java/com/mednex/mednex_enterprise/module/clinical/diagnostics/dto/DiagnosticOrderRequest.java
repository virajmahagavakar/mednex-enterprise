package com.mednex.mednex_enterprise.module.clinical.diagnostics.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class DiagnosticOrderRequest {
    private UUID patientId;
    private UUID appointmentId; // Optional
    private List<UUID> testCatalogIds;
    private String clinicalNotes;
}
