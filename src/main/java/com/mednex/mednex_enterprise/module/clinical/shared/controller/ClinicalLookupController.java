package com.mednex.mednex_enterprise.module.clinical.shared.controller;

import com.mednex.mednex_enterprise.module.clinical.appointment.dto.DoctorInfoDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.service.ReceptionistAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class ClinicalLookupController {

    private final ReceptionistAppointmentService receptionistAppointmentService;

    @GetMapping
    public ResponseEntity<List<DoctorInfoDTO>> getDoctors() {
        return ResponseEntity.ok(receptionistAppointmentService.getDoctors());
    }
}
