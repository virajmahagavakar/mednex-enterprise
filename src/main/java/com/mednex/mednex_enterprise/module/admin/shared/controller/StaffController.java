package com.mednex.mednex_enterprise.module.admin.shared.controller;

import com.mednex.mednex_enterprise.module.admin.shared.dto.StaffRegistrationRequest;
import com.mednex.mednex_enterprise.module.admin.shared.dto.StaffResponse;
import com.mednex.mednex_enterprise.module.admin.shared.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping("/onboard")
    @PreAuthorize("hasAnyRole('BRANCH_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<StaffResponse> onboardStaff(@Valid @RequestBody StaffRegistrationRequest request) {
        StaffResponse response = staffService.onboardStaff(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BRANCH_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<StaffResponse>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }
}
