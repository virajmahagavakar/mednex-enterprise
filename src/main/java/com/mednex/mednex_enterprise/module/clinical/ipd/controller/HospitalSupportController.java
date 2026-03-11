package com.mednex.mednex_enterprise.module.clinical.ipd.controller;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ipd.service.HospitalSupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class HospitalSupportController {

    private final HospitalSupportService hospitalSupportService;

    @PostMapping("/cleaning-request")
    public ResponseEntity<Void> requestCleaning(
            @AuthenticationPrincipal User currentUser,
            @RequestParam UUID bedId,
            @RequestParam String priority) {
        hospitalSupportService.requestCleaning(bedId, currentUser, priority);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cleaning-tasks/{taskId}/complete")
    public ResponseEntity<Void> completeCleaning(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID taskId) {
        hospitalSupportService.completeCleaning(taskId, currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/maintenance-request")
    public ResponseEntity<Void> requestMaintenance(
            @RequestParam UUID assetId,
            @RequestParam String description,
            @RequestParam String priority) {
        hospitalSupportService.scheduleMaintenance(assetId, description, priority);
        return ResponseEntity.ok().build();
    }
}
