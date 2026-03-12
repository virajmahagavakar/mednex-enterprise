package com.mednex.mednex_enterprise.module.clinical.ipd.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalSupportService {

    private static final Logger log = LoggerFactory.getLogger(HospitalSupportService.class);

    private final CleaningTaskRepository cleaningTaskRepository;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final BedRepository bedRepository;
    private final MedicalAssetRepository medicalAssetRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public void requestCleaning(UUID bedId, User requestedBy, String priority) {
        log.info("Requesting housekeeping for bed {}", bedId);
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));

        CleaningTask task = CleaningTask.builder()
                .bed(bed)
                .requestedBy(requestedBy)
                .priority(priority)
                .status("PENDING")
                .build();
        
        cleaningTaskRepository.save(task);
        bed.setStatus(BedStatus.CLEANING_REQUIRED);
        bedRepository.save(bed);
    }

    @Transactional
    public void completeCleaning(UUID taskId, User cleanedBy) {
        CleaningTask task = cleaningTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        task.setStatus("COMPLETED");
        task.setCleanedBy(cleanedBy);
        task.setCompletedAt(LocalDateTime.now());
        cleaningTaskRepository.save(task);

        Bed bed = task.getBed();
        bed.setStatus(BedStatus.AVAILABLE);
        bedRepository.save(bed);
    }

    @Transactional
    public void scheduleMaintenance(UUID assetId, String issueDescription, String priority) {
        log.info("Scheduling maintenance for asset {}", assetId);
        MedicalAsset asset = medicalAssetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        MaintenanceTask task = MaintenanceTask.builder()
                .asset(asset)
                .issueDescription(issueDescription)
                .scheduledDate(LocalDate.now().plusDays(1))
                .status("SCHEDULED")
                .build();
        
        maintenanceTaskRepository.save(task);
        asset.setStatus("UNDER_MAINTENANCE");
        medicalAssetRepository.save(asset);
    }
}
