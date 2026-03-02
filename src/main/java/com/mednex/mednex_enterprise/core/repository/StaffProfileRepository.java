package com.mednex.mednex_enterprise.core.repository;

import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import com.mednex.mednex_enterprise.core.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, UUID> {
    Optional<StaffProfile> findByUserId(UUID userId);

    Optional<StaffProfile> findByNationalIdNumber(String nationalIdNumber);

    Optional<StaffProfile> findByMedicalLicenseNumber(String licenseNumber);

    @Query("SELECT DISTINCT sp.specialization FROM StaffProfile sp JOIN sp.user u JOIN u.roles r WHERE r.name = 'DOCTOR' AND sp.specialization IS NOT NULL AND u.active = true")
    List<String> findDistinctDoctorSpecializations();

    @Query("SELECT sp.user FROM StaffProfile sp JOIN sp.user u JOIN u.roles r WHERE r.name = 'DOCTOR' AND sp.specialization = :specialization AND u.active = true")
    List<User> findDoctorsBySpecialization(@Param("specialization") String specialization);
}
