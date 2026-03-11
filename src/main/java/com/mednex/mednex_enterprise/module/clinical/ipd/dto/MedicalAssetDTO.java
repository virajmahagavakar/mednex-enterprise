package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalAssetDTO {
    private UUID id;
    private String name;
    private AssetType assetType;
    private String serialNumber;
    private String manufacturer;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;
    private Integer maintenanceCycleDays;
    private LocalDate lastMaintenanceDate;
    private String status;
    private String currentLocationType;
    private UUID currentLocationId;
}
