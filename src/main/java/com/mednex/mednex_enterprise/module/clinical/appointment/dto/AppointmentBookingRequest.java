package com.mednex.mednex_enterprise.module.clinical.appointment.dto;

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
public class AppointmentBookingRequest {
    private UUID doctorId;
    private LocalDateTime appointmentTime;
    private String reasonForVisit;
}
