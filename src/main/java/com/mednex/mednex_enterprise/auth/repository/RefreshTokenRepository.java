package com.mednex.mednex_enterprise.auth.repository;

import com.mednex.mednex_enterprise.auth.entity.RefreshToken;
import com.mednex.mednex_enterprise.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    int deleteByUser(User user);
}

