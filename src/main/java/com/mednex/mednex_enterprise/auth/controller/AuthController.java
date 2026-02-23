package com.mednex.mednex_enterprise.auth.controller;

import com.mednex.mednex_enterprise.auth.dto.AuthRequest;
import com.mednex.mednex_enterprise.auth.dto.AuthResponse;
import com.mednex.mednex_enterprise.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<com.mednex.mednex_enterprise.auth.dto.TokenRefreshResponse> refreshToken(
            @RequestBody com.mednex.mednex_enterprise.auth.dto.RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }
}
