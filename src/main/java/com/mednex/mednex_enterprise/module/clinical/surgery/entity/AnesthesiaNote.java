package com.mednex.mednex_enterprise.module.clinical.surgery.entity;

import com.mednex.mednex_enterprise.core.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "anesthesia_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnesthesiaNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surgery_schedule_id", nullable = false, unique = true)
    private SurgerySchedule surgery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author; // Typically the Anesthetist

    @Column(name = "anesthesia_type", nullable = false)
    private String anesthesiaType; // e.g., General, Regional, Local

    @Column(name = "medications_administered", columnDefinition = "TEXT")
    private String medicationsAdministered;

    @Column(name = "patient_vitals_summary", columnDefinition = "TEXT")
    private String patientVitalsSummary;

    @Column(name = "anesthetist_notes", columnDefinition = "TEXT")
    private String anesthetistNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
