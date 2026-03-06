package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateClinicalNoteRequest {
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;
    private LocalDateTime followUpDate;
}
