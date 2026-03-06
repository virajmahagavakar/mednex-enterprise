package com.mednex.mednex_enterprise.module.clinical.surgery.controller;

import com.mednex.mednex_enterprise.module.clinical.surgery.dto.AnesthesiaNoteRequest;
import com.mednex.mednex_enterprise.module.clinical.surgery.dto.SurgeryScheduleRequest;
import com.mednex.mednex_enterprise.module.clinical.surgery.dto.SurgicalNoteRequest;
import com.mednex.mednex_enterprise.module.clinical.surgery.entity.SurgeryStatus;
import com.mednex.mednex_enterprise.module.clinical.surgery.service.SurgeryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/surgery")
@RequiredArgsConstructor
public class SurgeryController {

    private final SurgeryService surgeryService;

    @GetMapping("/theatres")
    public ResponseEntity<?> getActiveTheatres() {
        return ResponseEntity.ok(surgeryService.getActiveTheatres());
    }

    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(surgeryService.getDailySchedule(start, end));
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> bookSurgery(@RequestBody SurgeryScheduleRequest request) {
        return ResponseEntity.ok(surgeryService.bookSurgery(request));
    }

    @PatchMapping("/schedule/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @RequestParam SurgeryStatus status) {
        return ResponseEntity.ok(surgeryService.updateSurgeryStatus(id, status));
    }

    @PostMapping("/schedule/{id}/notes/surgical")
    public ResponseEntity<?> addSurgicalNote(
            @PathVariable UUID id,
            @RequestBody SurgicalNoteRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(surgeryService.addSurgicalNote(id, request, authentication.getName()));
    }

    @PostMapping("/schedule/{id}/notes/anesthesia")
    public ResponseEntity<?> addAnesthesiaNote(
            @PathVariable UUID id,
            @RequestBody AnesthesiaNoteRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(surgeryService.addAnesthesiaNote(id, request, authentication.getName()));
    }
}
