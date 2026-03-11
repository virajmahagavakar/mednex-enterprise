package com.mednex.mednex_enterprise.module.clinical.ipd.controller;

import com.mednex.mednex_enterprise.module.clinical.ipd.dto.WardMapDTO;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.BedStatus;
import com.mednex.mednex_enterprise.module.clinical.ipd.service.BedManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/receptionist/bed-map")
@RequiredArgsConstructor
public class BedMapController {

    private final BedManagementService bedManagementService;

    @GetMapping("/{wardId}")
    public ResponseEntity<WardMapDTO> getWardMap(@PathVariable UUID wardId) {
        return ResponseEntity.ok(bedManagementService.getWardMap(wardId));
    }

    @PatchMapping("/beds/{bedId}/status")
    public ResponseEntity<Void> updateBedStatus(@PathVariable UUID bedId, @RequestParam BedStatus status) {
        bedManagementService.updateBedStatus(bedId, status);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/beds/{bedId}/coordinates")
    public ResponseEntity<Void> setBedCoordinates(
            @PathVariable UUID bedId, 
            @RequestParam Integer x, 
            @RequestParam Integer y) {
        bedManagementService.setBedCoordinates(bedId, x, y);
        return ResponseEntity.ok().build();
    }
}
