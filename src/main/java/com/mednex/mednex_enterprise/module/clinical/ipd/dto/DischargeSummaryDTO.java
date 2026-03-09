package com.mednex.mednex_enterprise.module.clinical.ipd.dto;

import com.mednex.mednex_enterprise.module.clinical.doctor.dto.VitalsResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.PrescriptionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DischargeSummaryDTO {
    private UUID admissionId;
    private String patientName;
    private String patientGender;
    private String patientAge;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private String doctorName;
    private String wardName;
    private String bedNumber;
    private String reasonForAdmission;
    private String treatmentSummary; // Derived from clinical notes
    private List<VitalsResponse> vitalsHistory;
    private List<MedicationAdministrationDTO> medicationHistory;
    private List<PrescriptionResponse> dischargePrescriptions;
}
