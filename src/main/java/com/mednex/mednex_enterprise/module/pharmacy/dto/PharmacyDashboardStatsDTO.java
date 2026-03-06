package com.mednex.mednex_enterprise.module.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyDashboardStatsDTO {
    private Long totalMedicines;
    private Integer lowStockAlerts;
    private Integer expiringSoonAlerts;
    private Integer pendingPrescriptions;
    private BigDecimal todayRevenue;
}
