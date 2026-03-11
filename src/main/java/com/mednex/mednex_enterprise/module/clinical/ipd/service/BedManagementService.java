package com.mednex.mednex_enterprise.module.clinical.ipd.service;

import com.mednex.mednex_enterprise.module.clinical.ipd.dto.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.*;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.AdmissionRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.BedRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.MedicalAssetRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.RoomRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BedManagementService {

    private static final Logger log = LoggerFactory.getLogger(BedManagementService.class);

    private final BedRepository bedRepository;
    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;
    private final AdmissionRepository admissionRepository;
    private final MedicalAssetRepository medicalAssetRepository;

    @Transactional(readOnly = true)
    public WardMapDTO getWardMap(UUID wardId) {
        log.info("Generating Matrix View for Ward: {}", wardId);
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new IllegalArgumentException("Ward not found"));

        List<RoomWithBedsDTO> rooms = roomRepository.findByWardId(wardId).stream()
                .map(room -> {
                    List<BedDTO> beds = bedRepository.findByRoomId(room.getId()).stream()
                            .map(this::mapToBedDTO)
                            .collect(Collectors.toList());

                    return RoomWithBedsDTO.builder()
                            .id(room.getId())
                            .roomNumber(room.getRoomNumber())
                            .roomType(room.getRoomType())
                            .status(room.getStatus())
                            .beds(beds)
                            .build();
                }).collect(Collectors.toList());

        return WardMapDTO.builder()
                .wardId(ward.getId())
                .wardName(ward.getName())
                .wardType(ward.getWardType())
                .rooms(rooms)
                .build();
    }

    @Transactional
    public void updateBedStatus(UUID bedId, BedStatus status) {
        log.info("Transitioning bed {} to status {}", bedId, status);
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));
        
        // Logical validation of state machine can be added here
        bed.setStatus(status);
        bedRepository.save(bed);
    }

    @Transactional
    public void setBedCoordinates(UUID bedId, Integer x, Integer y) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));
        bed.setCoordinatesX(x);
        bed.setCoordinatesY(y);
        bedRepository.save(bed);
    }

    private BedDTO mapToBedDTO(Bed bed) {
        BedPatientDTO patientDTO = null;
        
        // Find if any active admission is linked to this bed
        Optional<Admission> activeAdmission = admissionRepository.findTopByCurrentBedIdAndStatusOrderByAdmissionDateDesc(
                bed.getId(), AdmissionStatus.ADMITTED);
        
        if (activeAdmission.isPresent()) {
            Admission admission = activeAdmission.get();
            patientDTO = BedPatientDTO.builder()
                    .id(admission.getPatient().getId())
                    .name(admission.getPatient().getFirstName() + " " + admission.getPatient().getLastName())
                    .diagnosis(admission.getReasonForAdmission())
                    .admissionDate(admission.getAdmissionDate().toString())
                    .doctorName(admission.getAdmittingDoctor().getName())
                    .build();
        }

        List<MedicalAssetDTO> assets = medicalAssetRepository.findByCurrentLocationTypeAndCurrentLocationId("BED", bed.getId())
                .stream()
                .map(this::mapToAssetDTO)
                .collect(Collectors.toList());

        return BedDTO.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .bedType(bed.getBedType())
                .status(bed.getStatus())
                .roomId(bed.getRoom() != null ? bed.getRoom().getId() : null)
                .coordinatesX(bed.getCoordinatesX())
                .coordinatesY(bed.getCoordinatesY())
                .patient(patientDTO)
                .attachedAssets(assets)
                .build();
    }

    private MedicalAssetDTO mapToAssetDTO(MedicalAsset asset) {
        return MedicalAssetDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .assetType(asset.getAssetType())
                .serialNumber(asset.getSerialNumber())
                .status(asset.getStatus())
                .currentLocationType(asset.getCurrentLocationType())
                .currentLocationId(asset.getCurrentLocationId())
                .build();
    }
}
