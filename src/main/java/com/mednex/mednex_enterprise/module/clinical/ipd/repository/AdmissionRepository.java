package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Admission;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, UUID> {
    List<Admission> findByPatientIdOrderByAdmissionDateDesc(UUID patientId);

    List<Admission> findByStatus(AdmissionStatus status);

    List<Admission> findByAdmittingDoctorIdAndStatus(UUID doctorId, AdmissionStatus status);

    Optional<Admission> findTopByPatientIdAndStatusOrderByAdmissionDateDesc(UUID patientId, AdmissionStatus status);
}
