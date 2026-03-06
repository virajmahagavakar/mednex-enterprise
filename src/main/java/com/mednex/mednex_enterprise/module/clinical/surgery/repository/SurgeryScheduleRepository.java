package com.mednex.mednex_enterprise.module.clinical.surgery.repository;

import com.mednex.mednex_enterprise.module.clinical.surgery.entity.SurgerySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SurgeryScheduleRepository extends JpaRepository<SurgerySchedule, UUID> {
    List<SurgerySchedule> findByScheduledStartTimeBetweenOrderByScheduledStartTimeAsc(LocalDateTime start,
            LocalDateTime end);

    List<SurgerySchedule> findByPatientIdOrderByScheduledStartTimeDesc(UUID patientId);
}
