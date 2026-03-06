package com.mednex.mednex_enterprise.module.clinical.diagnostics.repository;

import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.DiagnosticOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiagnosticOrderRepository extends JpaRepository<DiagnosticOrder, UUID> {
    List<DiagnosticOrder> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
