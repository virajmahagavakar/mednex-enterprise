package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRoundDTO {
    private UUID id;
    private UUID admissionId;
    private UUID doctorId;
    private String doctorName;
    private LocalDateTime roundDate;
    private String clinicalNotes;
}
