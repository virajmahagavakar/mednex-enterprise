package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, UUID> {
    List<MaintenanceTask> findByStatus(String status);
    List<MaintenanceTask> findByAssetIdOrderByScheduledDateDesc(UUID assetId);
}
