package com.mednex.mednex_enterprise.module.clinical.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEMRResponse {
    private PatientResponse patientDetails;
    private List<ClinicalNoteResponse> clinicalNotes;
    private List<PrescriptionResponse> prescriptions;
    private List<VitalsResponse> vitalsHistory;
    private List<LabTestRequestResponse> labReports;
    private List<AdmissionSummaryDTO> admissionHistory;
}
