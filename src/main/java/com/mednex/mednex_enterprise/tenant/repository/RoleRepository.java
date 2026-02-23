package com.mednex.mednex_enterprise.tenant.repository;

import com.mednex.mednex_enterprise.tenant.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
