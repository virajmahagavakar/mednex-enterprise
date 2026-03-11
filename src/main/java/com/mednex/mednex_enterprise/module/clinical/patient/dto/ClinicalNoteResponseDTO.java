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
public class ClinicalNoteResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID appointmentId;
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;
    private LocalDateTime followUpDate;
    private String doctorName;
    private LocalDateTime createdAt;
}
