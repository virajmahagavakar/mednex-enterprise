package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

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
public class WardDTO {
    private UUID id;
    private String name;
    private UUID branchId;
    private Integer totalCapacity;
    private long occupiedBeds;
    private long availableBeds;
    private LocalDateTime createdAt;
}
