package com.mednex.mednex_enterprise.module.clinical.ambulance.dto;

import com.mednex.mednex_enterprise.module.clinical.ambulance.entity.AmbulanceStatus;
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
