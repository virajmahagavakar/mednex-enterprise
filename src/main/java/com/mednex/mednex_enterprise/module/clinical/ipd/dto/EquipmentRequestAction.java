package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentRequestAction {
    @NotBlank(message = "Equipment type is required")
    private String equipmentType;
    
    @NotBlank(message = "Priority is required")
    private String priority;
    
    private String notes;
}
