package com.mednex.mednex_enterprise.module.clinical.ipd.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "equipment_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id", nullable = false)
    private Admission admission;

    @Column(nullable = false)
    private String equipmentType; // Oxygen, Ventilator, Infusion Pump, etc.

    @Column(nullable = false)
    private String priority; // NORMAL, URGENT, EMERGENCY

    @Column(nullable = false)
    private String status; // REQUESTED, PROVIDED, RETURNED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime requestedAt;

    private LocalDateTime providedAt;
    private LocalDateTime returnedAt;
}
