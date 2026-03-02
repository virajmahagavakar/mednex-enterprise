package com.mednex.mednex_enterprise.module.clinical.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDashboardStatsDTO {
    private long upcomingAppointments;
    private long totalPrescriptions;
    private long unreadMessages;
    private String nextAppointmentDate;
}
