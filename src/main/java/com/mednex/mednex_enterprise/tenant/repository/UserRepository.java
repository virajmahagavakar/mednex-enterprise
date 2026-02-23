package com.mednex.mednex_enterprise.tenant.repository;

import com.mednex.mednex_enterprise.tenant.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
}
