package com.mednex.mednex_enterprise.module.clinical.ipd.service;

import com.mednex.mednex_enterprise.module.clinical.ipd.dto.MedicalAssetDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.MedicalAsset;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.MedicalAssetRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetManagementService {

    private static final Logger log = LoggerFactory.getLogger(AssetManagementService.class);

    private final MedicalAssetRepository medicalAssetRepository;

    @Transactional
    public MedicalAssetDTO registerAsset(MedicalAssetDTO dto) {
        log.info("Registering medical asset: {} (S/N: {})", dto.getName(), dto.getSerialNumber());
        MedicalAsset asset = MedicalAsset.builder()
                .name(dto.getName())
                .assetType(dto.getAssetType())
                .serialNumber(dto.getSerialNumber())
                .manufacturer(dto.getManufacturer())
                .purchaseDate(dto.getPurchaseDate())
                .warrantyExpiry(dto.getWarrantyExpiry())
                .maintenanceCycleDays(dto.getMaintenanceCycleDays())
                .lastMaintenanceDate(dto.getLastMaintenanceDate())
                .status("AVAILABLE")
                .currentLocationType(dto.getCurrentLocationType() != null ? dto.getCurrentLocationType() : "STORAGE")
                .currentLocationId(dto.getCurrentLocationId())
                .build();
        
        MedicalAsset saved = medicalAssetRepository.save(asset);
        return mapToDTO(saved);
    }

    @Transactional
    public void updateAssetLocation(UUID assetId, String locationType, UUID locationId) {
        MedicalAsset asset = medicalAssetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        asset.setCurrentLocationType(locationType);
        asset.setCurrentLocationId(locationId);
        medicalAssetRepository.save(asset);
    }

    @Transactional(readOnly = true)
    public List<MedicalAssetDTO> getAssetsByLocation(String type, UUID id) {
        return medicalAssetRepository.findByCurrentLocationTypeAndCurrentLocationId(type, id).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private MedicalAssetDTO mapToDTO(MedicalAsset asset) {
        return MedicalAssetDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .assetType(asset.getAssetType())
                .serialNumber(asset.getSerialNumber())
                .manufacturer(asset.getManufacturer())
                .purchaseDate(asset.getPurchaseDate())
                .warrantyExpiry(asset.getWarrantyExpiry())
                .maintenanceCycleDays(asset.getMaintenanceCycleDays())
                .lastMaintenanceDate(asset.getLastMaintenanceDate())
                .status(asset.getStatus())
                .currentLocationType(asset.getCurrentLocationType())
                .currentLocationId(asset.getCurrentLocationId())
                .build();
    }
}
