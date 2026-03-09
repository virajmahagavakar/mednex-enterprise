package com.mednex.mednex_enterprise.module.clinical.ambulance.entity;

import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ambulance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmbulanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "emergency_type", nullable = false)
    private String emergencyType;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AmbulanceStatus status;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = AmbulanceStatus.PENDING;
        }
    }
}
