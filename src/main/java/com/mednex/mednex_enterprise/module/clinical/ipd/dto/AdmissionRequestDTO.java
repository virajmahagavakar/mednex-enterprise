package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionRequestDTO {
    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotBlank(message = "Reason for admission is required")
    private String reasonForAdmission;

    @NotNull(message = "Urgency level is required")
    private UrgencyLevel urgencyLevel;

    private String department;
}
