package com.mednex.mednex_enterprise.module.clinical.doctor.repository;

import com.mednex.mednex_enterprise.module.clinical.doctor.entity.Vitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VitalsRepository extends JpaRepository<Vitals, UUID> {
    List<Vitals> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    List<Vitals> findByAdmissionIdOrderByRecordedAtDesc(UUID admissionId);
}
