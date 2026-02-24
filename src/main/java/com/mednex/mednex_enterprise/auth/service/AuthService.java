package com.mednex.mednex_enterprise.auth.service;

import com.mednex.mednex_enterprise.auth.dto.AuthRequest;
import com.mednex.mednex_enterprise.auth.dto.AuthResponse;
import com.mednex.mednex_enterprise.multitenancy.context.TenantContext;
import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
import com.mednex.mednex_enterprise.multitenancy.master.TenantRepository;
import com.mednex.mednex_enterprise.security.service.JwtService;
import com.mednex.mednex_enterprise.tenant.entity.User;
import com.mednex.mednex_enterprise.tenant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse authenticate(AuthRequest request) {
        // 1. Validate Tenant exists and is active in Master DB
        Tenant tenant = tenantRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        if (!tenant.isActive()) {
            throw new RuntimeException("Hospital account is inactive");
        }

        // 2. Map context to Tenant DB and extract user
        try {
            TenantContext.setCurrentTenant(request.getHospitalId());

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            if (!user.isActive()) {
                throw new RuntimeException("User account is disabled");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }

            // 3. Generate detailed JWT token payload
            Map<String, Object> extraClaims = new HashMap<>();

            extraClaims.put("hospital_id", tenant.getTenantId());
            extraClaims.put("subscription", tenant.getSubscriptionPlan());

            if (user.getPrimaryBranch() != null) {
                extraClaims.put("primary_branch_id", user.getPrimaryBranch().getId());
            }

            List<String> roleNames = user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toList());
            extraClaims.put("roles", roleNames);

            // Adding granular permissions to JWT
            List<String> permissions = user.getRoles().stream()
                    .flatMap(role -> role.getPermissions().stream())
                    .map(perm -> perm.getName())
                    .distinct()
                    .collect(Collectors.toList());
            extraClaims.put("permissions", permissions);

            List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = user.getRoles()
                    .stream()
                    .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.getName()))
                    .collect(Collectors.toList());

            // Using default implementation of UserDetails to leverage JWT generation
            org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                    user.getEmail(), user.getPassword(), authorities);

            String jwtToken = jwtService.generateToken(userDetails, extraClaims);

            // Delete old token and create new one
            refreshTokenService.deleteByUserId(user.getId());
            String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

            return AuthResponse.builder()
                    .token(jwtToken)
                    .refreshToken(refreshToken)
                    .hospitalId(tenant.getTenantId())
                    .build();

        } finally {
            TenantContext.clear();
        }
    }

    public com.mednex.mednex_enterprise.auth.dto.TokenRefreshResponse refreshToken(
            com.mednex.mednex_enterprise.auth.dto.RefreshRequest request) {
        try {
            TenantContext.setCurrentTenant(request.getHospitalId());

            return refreshTokenService.findByToken(request.getRefreshToken())
                    .map(refreshTokenService::verifyExpiration)
                    .map(com.mednex.mednex_enterprise.tenant.entity.RefreshToken::getUser)
                    .map(user -> {
                        // Generate extra claims specifically as done in login
                        Map<String, Object> extraClaims = new HashMap<>();
                        extraClaims.put("hospital_id", request.getHospitalId());
                        if (user.getPrimaryBranch() != null) {
                            extraClaims.put("primary_branch_id", user.getPrimaryBranch().getId());
                        }

                        List<String> roleNames = user.getRoles().stream()
                                .map(role -> role.getName())
                                .collect(Collectors.toList());
                        extraClaims.put("roles", roleNames);

                        List<String> permissions = user.getRoles().stream()
                                .flatMap(role -> role.getPermissions().stream())
                                .map(perm -> perm.getName())
                                .distinct()
                                .collect(Collectors.toList());
                        extraClaims.put("permissions", permissions);

                        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                                user.getEmail(), user.getPassword(), java.util.Collections.emptyList());

                        String accessToken = jwtService.generateToken(userDetails, extraClaims);

                        return com.mednex.mednex_enterprise.auth.dto.TokenRefreshResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(request.getRefreshToken())
                                .build();
                    })
                    .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));

        } finally {
            TenantContext.clear();
        }
    }
}
