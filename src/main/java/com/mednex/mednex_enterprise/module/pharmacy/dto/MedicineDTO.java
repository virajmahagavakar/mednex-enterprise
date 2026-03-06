package com.mednex.mednex_enterprise.module.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDTO {
    private UUID id;
    private String name;
    private String genericName;
    private String category;
    private String manufacturer;
    private String unit;
    private Integer minimumStockLevel;
    private Boolean requiresPrescription;
    private Boolean isActive;
    // Computed field in service
    private Integer currentStock;
}
