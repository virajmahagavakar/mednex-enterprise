package com.mednex.mednex_enterprise.module.clinical.appointment.entity;

import com.mednex.mednex_enterprise.core.entity.Branch;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // Doctor is assigned later during triage
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = true)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = true)
    private Branch branch;

    @Column(name = "appointment_time", nullable = true)
    private LocalDateTime appointmentTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @Column(name = "urgency_level")
    @Enumerated(EnumType.STRING)
    private UrgencyLevel urgencyLevel;

    @Column(name = "token_number")
    private Integer tokenNumber;

    @Column(name = "is_walk_in")
    private Boolean isWalkIn;

    @Column(name = "reason_for_visit", columnDefinition = "TEXT")
    private String reasonForVisit;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "problem_description", columnDefinition = "TEXT")
    private String problemDescription;

    @Column(name = "department_preference")
    private String departmentPreference;

    @Column(name = "preferred_date")
    private LocalDateTime preferredDate;

    @Column(columnDefinition = "TEXT")
    private String notes; // Doctor's notes

    @Column(columnDefinition = "TEXT")
    private String prescription; // Simple text prescription for now

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = AppointmentStatus.REQUESTED;
        }
        if (isWalkIn == null) {
            isWalkIn = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
