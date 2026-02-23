package com.mednex.mednex_enterprise.multitenancy.master;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, String> {
    Optional<Tenant> findByTenantIdAndActiveIsTrue(String tenantId);
}
