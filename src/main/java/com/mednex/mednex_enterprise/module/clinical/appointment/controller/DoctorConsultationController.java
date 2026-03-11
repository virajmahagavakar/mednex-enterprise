package com.mednex.mednex_enterprise.module.clinical.appointment.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientAppointmentResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.patient.dto.PatientEMRResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.service.DoctorConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clinical/doctors/appointments")
@RequiredArgsConstructor
public class DoctorConsultationController {

    private final DoctorConsultationService consultationService;

    @PutMapping("/{id}/deny")
    public ResponseEntity<PatientAppointmentResponseDTO> denyAppointment(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(consultationService.denyAppointment(doctor, id, reason));
    }

    @PutMapping("/{id}/transfer")
    public ResponseEntity<PatientAppointmentResponseDTO> transferAppointment(
            @AuthenticationPrincipal User doctor,
            @PathVariable UUID id,
            @RequestParam String newDepartment,
            @RequestParam(required = false) UUID newDoctorId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity
                .ok(consultationService.transferAppointment(doctor, id, newDepartment, newDoctorId, reason));
    }

    @GetMapping("/patients/{patientId}/emr")
    public ResponseEntity<PatientEMRResponseDTO> getPatientFullEMR(@PathVariable UUID patientId) {
        return ResponseEntity.ok(consultationService.getPatientFullEMR(patientId));
    }
}
