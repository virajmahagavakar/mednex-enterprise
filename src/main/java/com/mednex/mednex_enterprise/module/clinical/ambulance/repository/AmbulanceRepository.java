package com.mednex.mednex_enterprise.module.clinical.ambulance.repository;

import com.mednex.mednex_enterprise.module.clinical.ambulance.entity.AmbulanceRequest;
import com.mednex.mednex_enterprise.module.clinical.ambulance.entity.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AmbulanceRepository extends JpaRepository<AmbulanceRequest, UUID> {
    
    List<AmbulanceRequest> findByStatusOrderByRequestedAtDesc(AmbulanceStatus status);
    
    List<AmbulanceRequest> findByPatientIdOrderByRequestedAtDesc(UUID patientId);

    @Query("SELECT a FROM AmbulanceRequest a JOIN FETCH a.patient WHERE a.status IN :statuses ORDER BY a.requestedAt DESC")
    List<AmbulanceRequest> findByStatusInWithPatient(List<AmbulanceStatus> statuses);
}
