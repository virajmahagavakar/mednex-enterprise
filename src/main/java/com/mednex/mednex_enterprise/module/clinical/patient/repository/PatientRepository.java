package com.mednex.mednex_enterprise.module.clinical.patient.repository;

import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.mednex.mednex_enterprise.core.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByPhone(String phone);

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.user u LEFT JOIN FETCH p.registeredBranch b WHERE b.id = :branchId")
    List<Patient> findByRegisteredBranchId(@Param("branchId") UUID branchId);

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.user u LEFT JOIN FETCH p.registeredBranch b WHERE u.id = :#{#user.id}")
    Optional<Patient> findByUser(@Param("user") User user);
}
