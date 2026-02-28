package com.mednex.mednex_enterprise.core.repository;

import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, UUID> {
    Optional<StaffProfile> findByUserId(UUID userId);

    Optional<StaffProfile> findByNationalIdNumber(String nationalIdNumber);

    Optional<StaffProfile> findByMedicalLicenseNumber(String licenseNumber);
}

