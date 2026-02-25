package com.mednex.mednex_enterprise.auth.service;

import com.mednex.mednex_enterprise.security.service.JwtService;
import com.mednex.mednex_enterprise.auth.entity.RefreshToken;
import com.mednex.mednex_enterprise.auth.repository.RefreshTokenRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${application.security.jwt.refresh-token.expiration:604800000}")
    private long refreshTokenDurationMs;

    public RefreshToken createRefreshToken(UUID userId) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")))
                .token(jwtService.generateRefreshToken(new User("mock", "mock", java.util.Collections.emptyList()))) // Dummy
                                                                                                                     // UserDetails
                                                                                                                     // as
                                                                                                                     // it
                                                                                                                     // uses
                                                                                                                     // different
                                                                                                                     // generic
                                                                                                                     // sign
                                                                                                                     // string
                                                                                                                     // or
                                                                                                                     // UUID
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();

        // Alternatively, use UUID instead of JWT for Refresh tokens
        refreshToken.setToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Transactional
    public int deleteByUserId(UUID userId) {
        return refreshTokenRepository.deleteByUser(userRepository.findById(userId).get());
    }
}

