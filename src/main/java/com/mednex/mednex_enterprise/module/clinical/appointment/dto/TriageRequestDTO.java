package com.mednex.mednex_enterprise.module.clinical.appointment.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TriageRequestDTO {
    private UUID doctorId;
    private LocalDateTime appointmentTime;
    private UrgencyLevel urgencyLevel;
    private String notes;
}
