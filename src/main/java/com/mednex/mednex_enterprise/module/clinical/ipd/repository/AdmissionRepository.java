package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Admission;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, UUID> {
    @Query("SELECT a FROM Admission a JOIN FETCH a.patient p JOIN FETCH a.currentBed b JOIN FETCH b.ward w WHERE a.patient.id = :patientId ORDER BY a.admissionDate DESC")
    List<Admission> findByPatientIdOrderByAdmissionDateDesc(@Param("patientId") UUID patientId);

    List<Admission> findByStatusOrderByAdmissionDateDesc(AdmissionStatus status);

    @Query("SELECT a FROM Admission a JOIN FETCH a.patient p JOIN FETCH a.currentBed b JOIN FETCH b.ward w WHERE a.admittingDoctor.id = :doctorId AND a.status = :status")
    List<Admission> findByAdmittingDoctorIdAndStatus(@Param("doctorId") UUID doctorId, @Param("status") AdmissionStatus status);

    Optional<Admission> findTopByPatientIdAndStatusOrderByAdmissionDateDesc(UUID patientId, AdmissionStatus status);

    Optional<Admission> findTopByCurrentBedIdAndStatusOrderByAdmissionDateDesc(UUID currentBedId, AdmissionStatus status);

    @Query("SELECT COUNT(a) FROM Admission a WHERE a.admittingDoctor.id = :doctorId AND a.status = :status")
    long countByAdmittingDoctorIdAndStatus(@Param("doctorId") UUID doctorId, @Param("status") AdmissionStatus status);

    @Query("SELECT a FROM Admission a JOIN FETCH a.patient p JOIN FETCH a.currentBed b JOIN FETCH b.ward w WHERE w.branch.id = :branchId AND a.status IN :statuses")
    List<Admission> findByBranchIdAndStatuses(@Param("branchId") UUID branchId, @Param("statuses") List<AdmissionStatus> statuses);

    @Query("SELECT a FROM Admission a JOIN FETCH a.patient p JOIN FETCH a.currentBed b JOIN FETCH b.ward w WHERE w.id = :wardId AND a.status IN :statuses")
    List<Admission> findByWardIdAndStatuses(@Param("wardId") UUID wardId, @Param("statuses") List<AdmissionStatus> statuses);
}
