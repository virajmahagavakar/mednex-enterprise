package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentUpdateRequest {
    private AppointmentStatus status;
    private String notes;
    private String prescription;
}
