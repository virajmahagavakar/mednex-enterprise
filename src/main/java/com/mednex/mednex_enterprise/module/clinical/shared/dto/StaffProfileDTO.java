package com.mednex.mednex_enterprise.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffProfileDTO {

    // KYC Identity Fields
    @NotBlank(message = "National ID (e.g. Aadhaar/SSN) is mandatory for ALL staff")
    private String nationalIdNumber;

    @NotBlank(message = "Residential address is mandatory for ALL staff")
    private String residentialAddress;

    private String bloodGroup;

    private String emergencyContactNumber;

    // Clinical / Professional Fields
    private String medicalLicenseNumber;
    private String qualification;
    private String specialization;
    private String subSpecialty;
    private Integer yearsOfExperience;
    private BigDecimal defaultConsultationFee;
    private String biography;
}

