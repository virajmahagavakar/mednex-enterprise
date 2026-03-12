package com.mednex.mednex_enterprise.module.clinical.ipd.service;

import com.mednex.mednex_enterprise.module.clinical.ipd.dto.BuildingDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.FloorDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.RoomDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Building;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Floor;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Room;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.BuildingRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.FloorRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.RoomRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.WardRepository;
import com.mednex.mednex_enterprise.core.entity.Branch;
import com.mednex.mednex_enterprise.core.repository.BranchRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Ward;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InfrastructureService {

    private static final Logger log = LoggerFactory.getLogger(InfrastructureService.class);

    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;
    private final com.mednex.mednex_enterprise.core.repository.BranchRepository branchRepository;

    @Transactional
    public BuildingDTO createBuilding(BuildingDTO dto) {
        log.info("Creating building: {}", dto.getName());
        com.mednex.mednex_enterprise.core.entity.Branch branch = branchRepository.findById(dto.getBranchId())
            .orElseThrow(() -> new IllegalArgumentException("Branch not found"));
        Building building = Building.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .branch(branch)
                .build();
        Building saved = buildingRepository.save(building);
        return mapToBuildingDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<BuildingDTO> getBuildingsByBranch(UUID branchId) {
        return buildingRepository.findByBranchId(branchId).stream()
                .map(this::mapToBuildingDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FloorDTO createFloor(FloorDTO dto) {
        log.info("Creating floor {} in building {}", dto.getFloorNumber(), dto.getBuildingId());
        Building building = buildingRepository.findById(dto.getBuildingId())
                .orElseThrow(() -> new IllegalArgumentException("Building not found"));

        Floor floor = Floor.builder()
                .floorNumber(dto.getFloorNumber())
                .name(dto.getName())
                .building(building)
                .build();
        Floor saved = floorRepository.save(floor);
        return mapToFloorDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<FloorDTO> getFloorsByBuilding(UUID buildingId) {
        return floorRepository.findByBuildingId(buildingId).stream()
                .map(this::mapToFloorDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomDTO createRoom(RoomDTO dto) {
        log.info("Creating room {} in ward {}", dto.getRoomNumber(), dto.getWardId());
        com.mednex.mednex_enterprise.module.clinical.ipd.entity.Ward ward = wardRepository.findById(dto.getWardId())
            .orElseThrow(() -> new IllegalArgumentException("Ward not found"));
        Room room = Room.builder()
                .roomNumber(dto.getRoomNumber())
                .roomType(dto.getRoomType())
                .ward(ward)
                .status("CLEAN")
                .build();
        Room saved = roomRepository.save(room);
        return mapToRoomDTO(saved);
    }

    private BuildingDTO mapToBuildingDTO(Building building) {
        return BuildingDTO.builder()
                .id(building.getId())
                .name(building.getName())
                .description(building.getDescription())
                .branchId(building.getBranch() != null ? building.getBranch().getId() : null)
                .build();
    }

    private FloorDTO mapToFloorDTO(Floor floor) {
        return FloorDTO.builder()
                .id(floor.getId())
                .floorNumber(floor.getFloorNumber())
                .name(floor.getName())
                .buildingId(floor.getBuilding().getId())
                .build();
    }

    private RoomDTO mapToRoomDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .wardId(room.getWard() != null ? room.getWard().getId() : null)
                .status(room.getStatus())
                .build();
    }
}
