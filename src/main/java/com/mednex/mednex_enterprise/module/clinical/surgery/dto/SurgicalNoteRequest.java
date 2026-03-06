package com.mednex.mednex_enterprise.module.clinical.surgery.dto;

import lombok.Data;

@Data
public class SurgicalNoteRequest {
    private String preOpDiagnosis;
    private String postOpDiagnosis;
    private String operationPerformed;
    private String surgeonNotes;
    private String complications;
}
