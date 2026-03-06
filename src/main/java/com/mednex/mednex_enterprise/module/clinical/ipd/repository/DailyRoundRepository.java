package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.DailyRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DailyRoundRepository extends JpaRepository<DailyRound, UUID> {
    List<DailyRound> findByAdmissionIdOrderByRoundDateAsc(UUID admissionId);
}
