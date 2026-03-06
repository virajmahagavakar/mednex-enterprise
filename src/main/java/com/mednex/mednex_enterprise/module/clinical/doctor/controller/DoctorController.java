package com.mednex.mednex_enterprise.module.clinical.doctor.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.AppointmentUpdateRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.ClinicalNoteResponse;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.CreateClinicalNoteRequest;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.DoctorDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.clinical.doctor.dto.PatientResponse;
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
    public ResponseEntity<List<PatientResponse>> getPatients(@AuthenticationPrincipal User doctor) {
        List<PatientResponse> patients = doctorService.getPatientsForDoctor(doctor.getId())
                .stream()
                .map(p -> PatientResponse.builder()
                        .id(p.getId())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .email(p.getEmail())
                        .phone(p.getPhone())
                        .dateOfBirth(p.getDateOfBirth())
                        .gender(p.getGender())
                        .bloodGroup(p.getBloodGroup())
                        .medicalHistory(p.getMedicalHistory())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(patients);
    }

    @PostMapping("/appointments/{id}/notes")
    public ResponseEntity<ClinicalNoteResponse> createClinicalNote(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID id,
            @RequestBody CreateClinicalNoteRequest request) {
        return ResponseEntity.ok(doctorService.createClinicalNote(doctor.getId(), id, request));
    }

    @GetMapping("/patients/{patientId}/emr")
    public ResponseEntity<List<ClinicalNoteResponse>> getPatientEMR(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(doctorService.getClinicalNotesForPatientAsDoctor(doctor.getId(), patientId));
    }
}
