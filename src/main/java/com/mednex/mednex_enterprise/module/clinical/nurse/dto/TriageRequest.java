package com.mednex.mednex_enterprise.module.clinical.nurse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriageRequest {
    private String vitalsSnapshot; // Simple text area for vitals (BP, Temp, Weight)
    private String initialNotes; // Presenting complaint notes
    private boolean markAsReady; // If true, transitions to IN_PROGRESS for Doctor
}
