package com.mednex.mednex_enterprise.module.clinical.ipd.entity;

import com.mednex.mednex_enterprise.core.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTask {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private MedicalAsset asset;

    @Column(nullable = false)
    private String type; // PREVENTIVE, REPAIR

    @Column(nullable = false)
    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician;

    private LocalDate scheduledDate;
    private LocalDate completedDate;

    @Column(columnDefinition = "TEXT")
    private String issueDescription;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
