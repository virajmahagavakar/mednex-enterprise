package com.mednex.mednex_enterprise.module.clinical.ipd.entity;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.AdmissionStatus;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Bed;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admitting_doctor_id", nullable = false)
    private User admittingDoctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_bed_id")
    private Bed currentBed;

    @Column(nullable = false)
    private LocalDateTime admissionDate;

    private LocalDateTime dischargeDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdmissionStatus status;

    @Column(columnDefinition = "TEXT")
    private String reasonForAdmission;

    @Enumerated(EnumType.STRING)
    private UrgencyLevel urgencyLevel;

    private String department;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
