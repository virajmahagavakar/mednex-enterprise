package com.mednex.mednex_enterprise.module.clinical.nurse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NurseDashboardStatsDTO {
    private long waitingRoomCount;
    private long todayAppointments;
    private long criticalCases; // Placeholder for actual critical tracking
    private long triagedToday; // Placeholder
}
