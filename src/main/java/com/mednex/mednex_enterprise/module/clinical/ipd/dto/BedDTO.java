package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.BedStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedDTO {
    private UUID id;
    private UUID wardId;
    private String roomNumber;
    private String bedNumber;
    private BedStatus status;
}
