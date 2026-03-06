package com.mednex.mednex_enterprise.module.clinical.diagnostics.controller;

import com.mednex.mednex_enterprise.module.clinical.diagnostics.dto.DiagnosticOrderRequest;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.dto.DiagnosticResultUploadRequest;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.TestType;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.service.DiagnosticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/diagnostics")
@RequiredArgsConstructor
public class DiagnosticController {

    private final DiagnosticService diagnosticService;

    @GetMapping("/catalog")
    public ResponseEntity<?> getCatalog(@RequestParam(required = false) TestType type) {
        if (type != null) {
            return ResponseEntity.ok(diagnosticService.getTestsByType(type));
        }
        return ResponseEntity.ok(diagnosticService.getAllActiveTests());
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody DiagnosticOrderRequest request, Authentication authentication) {
        return ResponseEntity.ok(diagnosticService.createOrder(request, authentication.getName()));
    }

    @GetMapping("/patients/{patientId}/orders")
    public ResponseEntity<?> getPatientOrders(@PathVariable UUID patientId) {
        return ResponseEntity.ok(diagnosticService.getPatientOrders(patientId));
    }

    @GetMapping("/worklist")
    public ResponseEntity<?> getWorklist(@RequestParam TestType type) {
        return ResponseEntity.ok(diagnosticService.getPendingWorklist(type));
    }

    @PostMapping("/worklist/{lineItemId}/results")
    public ResponseEntity<?> uploadResult(
            @PathVariable UUID lineItemId,
            @RequestBody DiagnosticResultUploadRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(diagnosticService.uploadResult(lineItemId, request, authentication.getName()));
    }
}
