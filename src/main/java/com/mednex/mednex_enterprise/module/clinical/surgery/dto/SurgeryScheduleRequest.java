package com.mednex.mednex_enterprise.module.clinical.surgery.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SurgeryScheduleRequest {
    private UUID patientId;
    private UUID theatreId;
    private String procedureName;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private UUID primarySurgeonId;
    private UUID anesthetistId; // Optional
}
