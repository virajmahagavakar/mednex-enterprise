package com.mednex.mednex_enterprise.module.pharmacy.repository;

import com.mednex.mednex_enterprise.module.pharmacy.entity.PharmacyPrescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PharmacyPrescriptionRepository extends JpaRepository<PharmacyPrescription, UUID> {
    List<PharmacyPrescription> findByStatus(PharmacyPrescription.PrescriptionStatus status);
}
