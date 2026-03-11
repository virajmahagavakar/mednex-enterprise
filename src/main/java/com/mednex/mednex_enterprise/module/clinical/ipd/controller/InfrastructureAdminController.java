package com.mednex.mednex_enterprise.module.clinical.ipd.controller;

import com.mednex.mednex_enterprise.module.clinical.ipd.dto.BuildingDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.FloorDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.RoomDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.dto.MedicalAssetDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.service.InfrastructureService;
import com.mednex.mednex_enterprise.module.clinical.ipd.service.AssetManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/infrastructure")
@RequiredArgsConstructor
public class InfrastructureAdminController {

    private final InfrastructureService infrastructureService;
    private final AssetManagementService assetManagementService;

    @PostMapping("/buildings")
    public ResponseEntity<BuildingDTO> createBuilding(@Valid @RequestBody BuildingDTO dto) {
        return ResponseEntity.ok(infrastructureService.createBuilding(dto));
    }

    @GetMapping("/buildings")
    public ResponseEntity<List<BuildingDTO>> getBuildings(@RequestParam UUID branchId) {
        return ResponseEntity.ok(infrastructureService.getBuildingsByBranch(branchId));
    }

    @PostMapping("/floors")
    public ResponseEntity<FloorDTO> createFloor(@Valid @RequestBody FloorDTO dto) {
        return ResponseEntity.ok(infrastructureService.createFloor(dto));
    }

    @GetMapping("/buildings/{id}/floors")
    public ResponseEntity<List<FloorDTO>> getFloors(@PathVariable UUID id) {
        return ResponseEntity.ok(infrastructureService.getFloorsByBuilding(id));
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomDTO> createRoom(@Valid @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(infrastructureService.createRoom(dto));
    }

    @PostMapping("/assets")
    public ResponseEntity<MedicalAssetDTO> registerAsset(@Valid @RequestBody MedicalAssetDTO dto) {
        return ResponseEntity.ok(assetManagementService.registerAsset(dto));
    }
}
