package com.mednex.mednex_enterprise.module.clinical.appointment.controller;

import com.mednex.mednex_enterprise.module.clinical.appointment.dto.TriageRequestDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
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
    public ResponseEntity<List<Appointment>> getRequestedAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getRequestedAppointments());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Appointment>> getPendingAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getPendingAppointments());
    }

    @GetMapping("/today")
    public ResponseEntity<List<Appointment>> getTodayAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getTodayAppointments());
    }

    @PutMapping("/{id}/triage")
    public ResponseEntity<Appointment> triageAppointment(
            @PathVariable UUID id,
            @RequestBody TriageRequestDTO triageRequest) {
        return ResponseEntity.ok(receptionistAppointmentService.triageAppointment(id, triageRequest));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<Appointment> checkInPatient(@PathVariable UUID id) {
        return ResponseEntity.ok(receptionistAppointmentService.checkInPatient(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(
            @PathVariable UUID id,
            @RequestParam String reason) {
        return ResponseEntity.ok(receptionistAppointmentService.cancelAppointment(id, reason));
    }
}
