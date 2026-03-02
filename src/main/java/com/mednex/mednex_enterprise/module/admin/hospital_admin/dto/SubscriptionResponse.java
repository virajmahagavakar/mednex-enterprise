package com.mednex.mednex_enterprise.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private String hospitalName;
    private String plan;
    private String duration;
    private Double costPaid;
    private LocalDateTime expiryDate;
    private Long daysLeft;
    private boolean discountApplied;
}
