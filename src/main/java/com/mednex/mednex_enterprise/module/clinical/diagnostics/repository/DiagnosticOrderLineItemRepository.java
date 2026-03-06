package com.mednex.mednex_enterprise.module.clinical.diagnostics.repository;

import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.DiagnosticOrderLineItem;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.TestType;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiagnosticOrderLineItemRepository extends JpaRepository<DiagnosticOrderLineItem, UUID> {
    List<DiagnosticOrderLineItem> findByStatusAndCatalogItemType(OrderStatus status, TestType type);
}
