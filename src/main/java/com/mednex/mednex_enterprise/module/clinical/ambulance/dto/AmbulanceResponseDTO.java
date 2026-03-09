package com.mednex.mednex_enterprise.module.clinical.ambulance.dto;

import com.mednex.mednex_enterprise.module.clinical.ambulance.entity.AmbulanceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AmbulanceResponseDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String address;
    private String emergencyType;
    private String phoneNumber;
    private LocalDateTime requestedAt;
    private AmbulanceStatus status;
    private LocalDateTime dispatchedAt;
    private LocalDateTime completedAt;
}
