package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.MedicationAdministration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, UUID> {
    List<MedicationAdministration> findByAdmissionIdOrderByAdministeredAtDesc(UUID admissionId);
}
