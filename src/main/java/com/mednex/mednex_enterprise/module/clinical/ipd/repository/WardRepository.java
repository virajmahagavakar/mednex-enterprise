package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WardRepository extends JpaRepository<Ward, UUID> {
    List<Ward> findByBranchId(UUID branchId);
}
