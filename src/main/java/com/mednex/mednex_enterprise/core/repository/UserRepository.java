package com.mednex.mednex_enterprise.core.repository;

import com.mednex.mednex_enterprise.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE u.primaryBranch.id = :branchId AND r.name IN ('ROLE_BRANCH_ADMIN', 'BRANCH_ADMIN')")
    List<User> findBranchAdminsByBranchId(@Param("branchId") UUID branchId);

    List<User> findAllByRolesName(String roleName);
}
