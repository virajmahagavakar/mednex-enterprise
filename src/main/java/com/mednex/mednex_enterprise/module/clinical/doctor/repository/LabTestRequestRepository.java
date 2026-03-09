package com.mednex.mednex_enterprise.module.clinical.doctor.repository;

import com.mednex.mednex_enterprise.module.clinical.doctor.entity.LabTestRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabTestRequestRepository extends JpaRepository<LabTestRequest, UUID> {
    List<LabTestRequest> findByPatientIdOrderByRequestedAtDesc(UUID patientId);
}
