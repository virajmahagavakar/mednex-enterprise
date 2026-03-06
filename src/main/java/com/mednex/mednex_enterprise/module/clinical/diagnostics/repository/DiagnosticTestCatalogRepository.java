package com.mednex.mednex_enterprise.module.clinical.diagnostics.repository;

import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.DiagnosticTestCatalog;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.TestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiagnosticTestCatalogRepository extends JpaRepository<DiagnosticTestCatalog, UUID> {
    List<DiagnosticTestCatalog> findByTypeAndActiveTrue(TestType type);

    List<DiagnosticTestCatalog> findByActiveTrue();
}
