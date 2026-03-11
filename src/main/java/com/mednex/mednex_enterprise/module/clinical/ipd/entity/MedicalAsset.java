package com.mednex.mednex_enterprise.module.clinical.ipd.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Column(nullable = false, unique = true)
    private String serialNumber;

    private String manufacturer;

    private LocalDate purchaseDate;

    private LocalDate warrantyExpiry;

    private Integer maintenanceCycleDays;

    private LocalDate lastMaintenanceDate;

    @Column(nullable = false)
    private String status; // PROCURED, ACTIVE, ASSIGNED, MAINTENANCE_DUE, etc.

    private String currentLocationType; // BED, ROOM, WARD, STORAGE

    private UUID currentLocationId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
