package com.mednex.mednex_enterprise.module.clinical.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEMRResponseDTO {
    private PatientProfileDTO patientDetails;
    private List<ClinicalNoteResponseDTO> clinicalNotes;
    private List<PrescriptionResponseDTO> prescriptions;
    private List<LabTestRequestResponseDTO> labReports;
    private List<VitalsResponseDTO> vitalsHistory;
}
