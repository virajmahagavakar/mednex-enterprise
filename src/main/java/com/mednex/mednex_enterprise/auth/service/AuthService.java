package com.mednex.mednex_enterprise.auth.service;

import com.mednex.mednex_enterprise.auth.dto.AuthRequest;
import com.mednex.mednex_enterprise.auth.dto.AuthResponse;
import com.mednex.mednex_enterprise.multitenancy.context.TenantContext;
import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
import com.mednex.mednex_enterprise.multitenancy.master.TenantRepository;
import com.mednex.mednex_enterprise.security.service.JwtService;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.BranchRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.mednex.mednex_enterprise.core.entity.Role;
import com.mednex.mednex_enterprise.core.repository.RoleRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import com.mednex.mednex_enterprise.auth.dto.PatientRegistrationRequest;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final BranchRepository branchRepository;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;

    public AuthResponse authenticate(AuthRequest request) {
        // 1. Validate Tenant exists and is active in Master DB
        Tenant tenant = tenantRepository.findById(request.getHospitalId()).orElse(null);

        // If not found by exact ID, it might be a branch code. Let's search across all
        // tenants.
        if (tenant == null) {
            List<Tenant> allTenants = tenantRepository.findAll();
            for (Tenant t : allTenants) {
                if (!t.isActive())
                    continue;

                try {
                    TenantContext.setCurrentTenant(t.getTenantId());
                    // See if this tenant has a branch with this code
                    if (branchRepository.findByCode(request.getHospitalId()).isPresent()) {
                        tenant = t;
                        break;
                    }
                } catch (Exception e) {
                    // Ignore if DB isn't ready or branch not found
                } finally {
                    TenantContext.clear();
                }
            }
        }

        if (tenant == null) {
            throw new RuntimeException("Hospital not found");
        }

        if (!tenant.isActive()) {
            throw new RuntimeException("Hospital account is inactive");
        }

        // 2. Map context to Tenant DB and extract user
        try {
            TenantContext.setCurrentTenant(tenant.getTenantId());

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid email or password"));

            if (!user.isActive()) {
                throw new RuntimeException("User account is disabled");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid email or password");
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
            extraClaims.put("name", user.getName());

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
                    .name(user.getName())
                    .email(user.getEmail())
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
                    .map(com.mednex.mednex_enterprise.auth.entity.RefreshToken::getUser)
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
                        extraClaims.put("name", user.getName());

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
                                .token(accessToken)
                                .refreshToken(request.getRefreshToken())
                                .hospitalId(request.getHospitalId())
                                .build();
                    })
                    .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));

        } finally {
            TenantContext.clear();
        }
    }

    public AuthResponse registerPatient(PatientRegistrationRequest request) {
        String providedId = request.getHospitalId();
        Tenant tenant = tenantRepository.findById(providedId).orElse(null);
        String resolvedBranchCode = null;

        if (tenant == null) {
            List<Tenant> allTenants = tenantRepository.findAll();
            for (Tenant t : allTenants) {
                if (!t.isActive())
                    continue;
                try {
                    TenantContext.setCurrentTenant(t.getTenantId());
                    if (branchRepository.findByCode(providedId).isPresent()) {
                        tenant = t;
                        resolvedBranchCode = providedId;
                        break;
                    }
                } catch (Exception e) {
                } finally {
                    TenantContext.clear();
                }
            }
        } else {
            // Provided direct Tenant ID, fallback to MAIN branch
            resolvedBranchCode = "MAIN";
        }

        if (tenant == null) {
            throw new RuntimeException("Hospital not found");
        }

        if (!tenant.isActive()) {
            throw new RuntimeException("Hospital account is inactive");
        }

        try {
            TenantContext.setCurrentTenant(tenant.getTenantId());

            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }

            Role patientRole = roleRepository.findByName("PATIENT")
                    .orElseThrow(() -> new RuntimeException("PATIENT role not found"));

            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setName(request.getFirstName() + " " + request.getLastName());
            user.setRoles(Set.of(patientRole));
            user.setActive(true);
            userRepository.save(user);

            // Also create or link the clinical Patient entity
            Optional<Patient> existingPatient = patientRepository.findByEmail(request.getEmail());
            if (existingPatient.isEmpty()) {
                Patient newPatient = new Patient();
                newPatient.setFirstName(request.getFirstName());
                newPatient.setLastName(request.getLastName());
                newPatient.setEmail(request.getEmail());
                newPatient.setPhone(request.getPhoneNumber());

                // Assign branch
                if (resolvedBranchCode != null) {
                    branchRepository.findByCode(resolvedBranchCode).ifPresent(newPatient::setRegisteredBranch);
                }

                // If branch still null, try just finding any branch as safety fallback
                if (newPatient.getRegisteredBranch() == null) {
                    branchRepository.findAll().stream().findFirst().ifPresent(newPatient::setRegisteredBranch);
                }

                patientRepository.save(newPatient);
            }

            // Authenticate directly after registration
            return authenticate(AuthRequest.builder()
                    .email(request.getEmail())
                    .password(request.getPassword())
                    .hospitalId(request.getHospitalId())
                    .build());

        } finally {
            TenantContext.clear();
        }
    }
}
