package com.mednex.mednex_enterprise.module.clinical.ipd.entity;

import com.mednex.mednex_enterprise.core.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medication_administrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationAdministration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id", nullable = false)
    private Admission admission;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String dosage;

    private String route; // Oral, IV, IM, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administered_by", nullable = false)
    private User administeredBy;

    @Column(nullable = false)
    private LocalDateTime administeredAt;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
