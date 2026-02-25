package com.mednex.mednex_enterprise.admin.controller;

import com.mednex.mednex_enterprise.admin.dto.BranchRequest;
import com.mednex.mednex_enterprise.admin.dto.BranchResponse;
import com.mednex.mednex_enterprise.admin.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @PostMapping
    @PreAuthorize("hasAuthority('HOSPITAL_ADMIN')")
    public ResponseEntity<BranchResponse> createBranch(@Valid @RequestBody BranchRequest request) {
        BranchResponse response = branchService.createBranch(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }
}

