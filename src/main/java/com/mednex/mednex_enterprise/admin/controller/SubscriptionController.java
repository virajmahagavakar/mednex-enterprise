package com.mednex.mednex_enterprise.admin.controller;

import com.mednex.mednex_enterprise.admin.dto.SubscriptionResponse;
import com.mednex.mednex_enterprise.admin.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/status")
    @PreAuthorize("hasAnyAuthority('HOSPITAL_ADMIN', 'BRANCH_ADMIN')")
    public ResponseEntity<SubscriptionResponse> getSubscriptionStatus() {
        return ResponseEntity.ok(subscriptionService.getSubscriptionStatus());
    }

    @PostMapping("/renew")
    @PreAuthorize("hasAnyAuthority('HOSPITAL_ADMIN', 'BRANCH_ADMIN')")
    public ResponseEntity<SubscriptionResponse> renewSubscription(
            @Valid @RequestBody com.mednex.mednex_enterprise.admin.dto.SubscriptionRequest request) {
        return ResponseEntity.ok(subscriptionService.renewSubscription(request.getDuration()));
    }
}
