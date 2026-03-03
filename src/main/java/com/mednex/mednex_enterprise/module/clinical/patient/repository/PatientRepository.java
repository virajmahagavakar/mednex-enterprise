package com.mednex.mednex_enterprise.module.clinical.patient.repository;

import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mednex.mednex_enterprise.core.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByPhone(String phone);

    List<Patient> findByRegisteredBranchId(UUID branchId);

    Optional<Patient> findByUser(User user);
}
