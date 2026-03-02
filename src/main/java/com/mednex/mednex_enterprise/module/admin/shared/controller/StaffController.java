package com.mednex.mednex_enterprise.admin.controller;

import com.mednex.mednex_enterprise.admin.dto.StaffRegistrationRequest;
import com.mednex.mednex_enterprise.admin.dto.StaffResponse;
import com.mednex.mednex_enterprise.admin.service.StaffService;
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
@RequestMapping("/api/admin/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping("/onboard")
    @PreAuthorize("hasAuthority('BRANCH_ADMIN') or hasAuthority('HOSPITAL_ADMIN')")
    public ResponseEntity<StaffResponse> onboardStaff(@Valid @RequestBody StaffRegistrationRequest request) {
        StaffResponse response = staffService.onboardStaff(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('BRANCH_ADMIN') or hasAuthority('HOSPITAL_ADMIN')")
    public ResponseEntity<List<StaffResponse>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }
}
