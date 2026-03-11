package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.BedStatus;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.BedType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedDTO {
    private UUID id;
    private String bedNumber;
    private BedType bedType;
    private BedStatus status;
    private UUID roomId;
    private Integer coordinatesX;
    private Integer coordinatesY;
    private BedPatientDTO patient;
    private List<MedicalAssetDTO> attachedAssets;
}
