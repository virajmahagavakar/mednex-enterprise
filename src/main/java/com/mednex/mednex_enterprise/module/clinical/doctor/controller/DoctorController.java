package com.mednex.mednex_enterprise.module.clinical.doctor.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.*;
import com.mednex.mednex_enterprise.module.clinical.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/clinical/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/dashboard")
    public ResponseEntity<DoctorDashboardStatsDTO> getDashboardStats(@AuthenticationPrincipal User doctor) {
        return ResponseEntity.ok(doctorService.getDashboardStats(doctor.getId()));
    }

    @GetMapping("/dashboard/detailed")
    public ResponseEntity<List<DashboardChartDataDTO>> getDetailedStats(@AuthenticationPrincipal User doctor) {
        return ResponseEntity.ok(doctorService.getDetailedStats(doctor.getId()));
    }

    @GetMapping("/queue")
    public ResponseEntity<List<AppointmentResponse>> getWaitingQueue(@AuthenticationPrincipal User doctor) {
        return ResponseEntity.ok(doctorService.getWaitingQueue(doctor.getId()));
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<List<AppointmentResponse>> getTodayAppointments(@AuthenticationPrincipal User doctor) {
        return ResponseEntity.ok(doctorService.getTodayAppointments(doctor.getId()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @AuthenticationPrincipal User doctor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(doctorService.getAppointmentsByDateRange(doctor.getId(), date, date));
        }
        return ResponseEntity.ok(doctorService.getAllAppointments(doctor.getId()));
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentDetails(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.getAppointmentDetails(doctor.getId(), id));
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID id,
            @RequestBody AppointmentUpdateRequest request) {
        return ResponseEntity.ok(doctorService.updateAppointment(doctor.getId(), id, request));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientSummaryDTO>> getPatients(@AuthenticationPrincipal User doctor) {
        return ResponseEntity.ok(doctorService.getPatientsForDoctor(doctor.getId()));
    }

    @PostMapping("/appointments/{id}/notes")
    public ResponseEntity<ClinicalNoteResponse> createClinicalNote(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID id,
            @RequestBody CreateClinicalNoteRequest request) {
        return ResponseEntity.ok(doctorService.createClinicalNote(doctor.getId(), id, request));
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<PatientEMRResponse> getPatientFullEMR(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(doctorService.getPatientFullEMR(doctor.getId(), patientId));
    }

    @PostMapping("/patients/{patientId}/notes")
    public ResponseEntity<ClinicalNoteResponse> createPatientNote(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID patientId,
            @RequestBody CreateClinicalNoteRequest request) {
        // Find if there is an active appointment to link
        // For simplicity in a multi-modal EMR, we allow notes without mandatory appointment link in new endpoints
        return ResponseEntity.ok(doctorService.createClinicalNote(doctor.getId(), null, request));
    }

    @PostMapping("/patients/{patientId}/prescriptions")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID patientId,
            @RequestBody CreatePrescriptionRequest request) {
        return ResponseEntity.ok(doctorService.createPrescription(doctor.getId(), patientId, request));
    }

    @PostMapping("/patients/{patientId}/lab-tests")
    public ResponseEntity<LabTestRequestResponse> requestLabTest(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID patientId,
            @RequestBody CreateLabTestRequest request) {
        return ResponseEntity.ok(doctorService.requestLabTest(doctor.getId(), patientId, request));
    }

    @PostMapping("/patients/{patientId}/vitals")
    public ResponseEntity<VitalsResponse> recordVitals(
            @PathVariable UUID patientId,
            @RequestBody VitalsRequest request) {
        return ResponseEntity.ok(doctorService.recordVitals(patientId, request));
    }
}
