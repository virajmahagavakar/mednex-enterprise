package com.mednex.mednex_enterprise.module.clinical.diagnostics.repository;

import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.DiagnosticResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DiagnosticResultRepository extends JpaRepository<DiagnosticResult, UUID> {
}
