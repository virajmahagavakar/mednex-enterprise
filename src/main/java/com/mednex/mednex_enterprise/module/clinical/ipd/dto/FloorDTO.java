package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorDTO {
    private UUID id;
    private Integer floorNumber;
    private String name;
    private UUID buildingId;
}
