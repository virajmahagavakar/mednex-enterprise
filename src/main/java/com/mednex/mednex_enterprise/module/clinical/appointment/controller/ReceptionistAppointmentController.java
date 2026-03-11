package com.mednex.mednex_enterprise.module.clinical.appointment.controller;

import com.mednex.mednex_enterprise.module.clinical.appointment.dto.AppointmentResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.DoctorInfoDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.TriageRequestDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.service.ReceptionistAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/receptionist/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN')")
public class ReceptionistAppointmentController {

    private final ReceptionistAppointmentService receptionistAppointmentService;

    @GetMapping("/requests")
    public ResponseEntity<List<AppointmentResponseDTO>> getRequestedAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getRequestedAppointments());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorInfoDTO>> getDoctors() {
        return ResponseEntity.ok(receptionistAppointmentService.getDoctors());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AppointmentResponseDTO>> getPendingAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getPendingAppointments());
    }

    @GetMapping("/today")
    public ResponseEntity<List<AppointmentResponseDTO>> getTodayAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getTodayAppointments());
    }

    @PutMapping("/{id}/triage")
    public ResponseEntity<AppointmentResponseDTO> triageAppointment(
            @PathVariable UUID id,
            @RequestBody TriageRequestDTO triageRequest) {
        return ResponseEntity.ok(receptionistAppointmentService.triageAppointment(id, triageRequest));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<AppointmentResponseDTO> checkInPatient(@PathVariable UUID id) {
        return ResponseEntity.ok(receptionistAppointmentService.checkInPatient(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(
            @PathVariable UUID id,
            @RequestParam String reason) {
        return ResponseEntity.ok(receptionistAppointmentService.cancelAppointment(id, reason));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AppointmentResponseDTO> approveAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(receptionistAppointmentService.approveAppointment(id));
    }
}
