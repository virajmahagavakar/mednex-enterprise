package com.mednex.mednex_enterprise.security.filter;

import com.mednex.mednex_enterprise.multitenancy.context.TenantContext;
import com.mednex.mednex_enterprise.security.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        final String tenantId;

        // Immediately skip filter for public/auth routes or without Bearer Token
        if (request.getServletPath().contains("/api/auth") ||
                request.getServletPath().contains("/api/public") ||
                authHeader == null ||
                !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(jwt);
            tenantId = jwtService.extractTenantId(jwt);
        } catch (Exception e) {
            // Only catch JWT parsing/validation errors here
            System.err.println("JWT Token Invalid: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Invalid or expired token\"}");
            return;
        }

        try {
            // Critical! Set the tenant context so the Database Route hits the right schemas
            if (tenantId != null) {
                TenantContext.setCurrentTenant(tenantId);
            }

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Extract roles and permissions from JWT
                    List<String> roles = jwtService.extractRoles(jwt);
                    List<String> permissions = jwtService.extractPermissions(jwt);

                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                    // Process Roles - ensure ROLE_ prefix
                    if (roles != null) {
                        roles.stream()
                                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                                .map(SimpleGrantedAuthority::new)
                                .forEach(authorities::add);
                    }

                    // Process Permissions
                    if (permissions != null) {
                        permissions.stream()
                                .map(SimpleGrantedAuthority::new)
                                .forEach(authorities::add);
                    }

                    // Fallback to DB authorities if token is empty (legacy support)
                    if (authorities.isEmpty()) {
                        authorities.addAll(userDetails.getAuthorities().stream()
                                .map(auth -> (SimpleGrantedAuthority) auth)
                                .collect(Collectors.toList()));
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities);
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
