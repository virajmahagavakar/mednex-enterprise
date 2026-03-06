package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.AdmissionStatus;
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
public class AdmissionDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID admittingDoctorId;
    private String admittingDoctorName;
    private UUID currentBedId;
    private String bedNumber;
    private String wardName;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private AdmissionStatus status;
    private String reasonForAdmission;
}
