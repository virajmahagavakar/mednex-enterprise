package com.mednex.mednex_enterprise.module.admin.hospital_admin.controller;

import com.mednex.mednex_enterprise.module.admin.hospital_admin.dto.RoleResponse;
import com.mednex.mednex_enterprise.module.admin.hospital_admin.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'BRANCH_ADMIN')")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }
}
