package com.mednex.mednex_enterprise.module.admin.shared.controller;

import com.mednex.mednex_enterprise.module.admin.shared.dto.ProfileRequest;
import com.mednex.mednex_enterprise.module.admin.shared.dto.ProfileResponse;
import com.mednex.mednex_enterprise.module.admin.shared.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @PreAuthorize("isAuthenticated()") // Any logged-in user can view their profile
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }
}
