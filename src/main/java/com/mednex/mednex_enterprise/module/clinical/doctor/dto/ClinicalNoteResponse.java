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
public class ClinicalNoteResponse {
    private UUID id;
    private UUID patientId;
    private UUID appointmentId;
    private UUID doctorId;
    private String doctorName;
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;
    private LocalDateTime followUpDate;
    private LocalDateTime createdAt;
}
