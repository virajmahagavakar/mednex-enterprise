package com.mednex.mednex_enterprise.module.clinical.diagnostics.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class DiagnosticResultUploadRequest {
    private String resultValue;
    private String interpretationFlag;
    private String remarks;

    // For Radiology
    private String dicomStudyUid;
    private String dicomSeriesUid;
    private String documentUrl;
}
