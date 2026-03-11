package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.MedicalAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalAssetRepository extends JpaRepository<MedicalAsset, UUID> {
    List<MedicalAsset> findByCurrentLocationTypeAndCurrentLocationId(String type, UUID id);
    List<MedicalAsset> findBySerialNumber(String serialNumber);
}
