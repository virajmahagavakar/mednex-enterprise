package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.EquipmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EquipmentRequestRepository extends JpaRepository<EquipmentRequest, UUID> {
    List<EquipmentRequest> findByAdmissionIdOrderByRequestedAtDesc(UUID admissionId);
    List<EquipmentRequest> findByStatus(String status);
}
