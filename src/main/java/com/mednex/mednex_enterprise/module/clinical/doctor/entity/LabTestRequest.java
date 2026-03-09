package com.mednex.mednex_enterprise.module.clinical.doctor.entity;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lab_test_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(name = "appointment_id")
    private UUID appointmentId;

    @Column(name = "test_type", nullable = false)
    private String testType; // MRI, CT Scan, X-Ray, Blood Test, etc.

    private String priority; // NORMAL, URGENT, EMERGENCY
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LabRequestStatus status = LabRequestStatus.PENDING;

    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }

    public enum LabRequestStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
