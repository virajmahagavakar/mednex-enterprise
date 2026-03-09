package com.mednex.mednex_enterprise.module.admin.hospital_admin.controller;

import com.mednex.mednex_enterprise.module.admin.hospital_admin.dto.BranchRequest;
import com.mednex.mednex_enterprise.module.admin.hospital_admin.dto.BranchResponse;
import com.mednex.mednex_enterprise.module.admin.hospital_admin.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<BranchResponse> createBranch(@Valid @RequestBody BranchRequest request) {
        BranchResponse response = branchService.createBranch(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @DeleteMapping("/{branchId}/admin")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<Void> removeBranchAdmin(@PathVariable java.util.UUID branchId) {
        branchService.removeBranchAdmin(branchId);
        return ResponseEntity.noContent().build();
    }
}
