package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDashboardStatsDTO {
    private long totalPatients;
    private long todayAppointments;
    private long upcomingAppointments;
    private long waitingQueueCount;
    private long checkedInToday;
    private long completedToday;
    private long activeIpdPatients;
    private String nextAppointmentTime;
    private long pendingPrescriptions; // Placeholder for future feature
}
