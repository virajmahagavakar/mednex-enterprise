package com.mednex.mednex_enterprise.module.clinical.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorInfoDTO {
    private UUID id;
    private String name;
    private String specialization;
    private String qualification;
    private Integer yearsOfExperience;
    private BigDecimal defaultConsultationFee;
}
