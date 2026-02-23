package com.mednex.mednex_enterprise.tenant.controller;

import com.mednex.mednex_enterprise.tenant.dto.HospitalRegistrationRequest;
import com.mednex.mednex_enterprise.tenant.service.TenantProvisioningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicRegistrationController {

    @Autowired
    private TenantProvisioningService tenantProvisioningService;

    @PostMapping("/register-hospital")
    public ResponseEntity<Map<String, String>> registerHospital(@RequestBody HospitalRegistrationRequest request) {
        try {
            String tenantId = tenantProvisioningService.registerNewHospital(request);

            // In a real application, we would generate a temporary JWT and send an email
            // here.

            Map<String, String> response = new HashMap<>();
            response.put("message", "Hospital registered successfully.");
            response.put("tenantId", tenantId);
            // Mocking a temporary token for the initial login
            response.put("temporaryToken", "mock-temp-jwt-for-" + tenantId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
