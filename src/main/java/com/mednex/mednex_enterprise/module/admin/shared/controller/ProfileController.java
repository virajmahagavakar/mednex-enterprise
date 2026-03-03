package com.mednex.mednex_enterprise.admin.controller;

import com.mednex.mednex_enterprise.admin.dto.ProfileRequest;
import com.mednex.mednex_enterprise.admin.dto.ProfileResponse;
import com.mednex.mednex_enterprise.admin.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/profile")
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
