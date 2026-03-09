package com.mednex.mednex_enterprise.module.clinical.appointment.controller;

<<<<<<< HEAD
=======
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.AppointmentResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.DoctorInfoDTO;
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
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
<<<<<<< HEAD
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
=======
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN')")
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
public class ReceptionistAppointmentController {

    private final ReceptionistAppointmentService receptionistAppointmentService;

    @GetMapping("/requests")
<<<<<<< HEAD
    public ResponseEntity<List<Appointment>> getRequestedAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getRequestedAppointments());
    }

    @GetMapping("/today")
    public ResponseEntity<List<Appointment>> getTodayAppointments() {
        return ResponseEntity.ok(receptionistAppointmentService.getAllAppointmentsForToday());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Appointment> approveAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(receptionistAppointmentService.approveAppointment(id));
    }

    @PutMapping("/{id}/triage")
    public ResponseEntity<Appointment> triageAppointment(
=======
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
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
            @PathVariable UUID id,
            @RequestBody TriageRequestDTO triageRequest) {
        return ResponseEntity.ok(receptionistAppointmentService.triageAppointment(id, triageRequest));
    }

<<<<<<< HEAD
    @PostMapping("/{id}/check-in")
    public ResponseEntity<Appointment> checkInPatient(@PathVariable UUID id) {
        return ResponseEntity.ok(receptionistAppointmentService.checkInPatient(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(
=======
    @PutMapping("/{id}/check-in")
    public ResponseEntity<AppointmentResponseDTO> checkInPatient(@PathVariable UUID id) {
        return ResponseEntity.ok(receptionistAppointmentService.checkInPatient(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
            @PathVariable UUID id,
            @RequestParam String reason) {
        return ResponseEntity.ok(receptionistAppointmentService.cancelAppointment(id, reason));
    }
<<<<<<< HEAD
=======

    @PutMapping("/{id}/approve")
    public ResponseEntity<AppointmentResponseDTO> approveAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(receptionistAppointmentService.approveAppointment(id));
    }
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
}
