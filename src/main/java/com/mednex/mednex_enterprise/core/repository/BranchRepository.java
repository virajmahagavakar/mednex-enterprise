package com.mednex.mednex_enterprise.core.repository;

import com.mednex.mednex_enterprise.core.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<Branch, UUID> {
}

