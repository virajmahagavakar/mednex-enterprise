package com.mednex.mednex_enterprise.core.repository;

import com.mednex.mednex_enterprise.core.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}

