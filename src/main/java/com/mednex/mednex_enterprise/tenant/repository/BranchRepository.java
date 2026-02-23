package com.mednex.mednex_enterprise.tenant.repository;

import com.mednex.mednex_enterprise.tenant.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<Branch, UUID> {
}
