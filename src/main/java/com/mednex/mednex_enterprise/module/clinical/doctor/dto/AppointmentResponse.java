package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
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
public class AppointmentResponse {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private LocalDateTime appointmentTime;
    private AppointmentStatus status;
    private String reasonForVisit;
    private String notes;
    private Integer tokenNumber;
    private Boolean isWalkIn;
}
