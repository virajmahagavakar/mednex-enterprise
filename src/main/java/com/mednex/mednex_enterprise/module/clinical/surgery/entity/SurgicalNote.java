package com.mednex.mednex_enterprise.module.clinical.surgery.entity;

import com.mednex.mednex_enterprise.core.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "surgical_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurgicalNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surgery_schedule_id", nullable = false, unique = true)
    private SurgerySchedule surgery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author; // Typically the Primary Surgeon

    @Column(name = "pre_op_diagnosis", columnDefinition = "TEXT")
    private String preOpDiagnosis;

    @Column(name = "post_op_diagnosis", columnDefinition = "TEXT")
    private String postOpDiagnosis;

    @Column(name = "operation_performed", columnDefinition = "TEXT", nullable = false)
    private String operationPerformed;

    @Column(name = "surgeon_notes", columnDefinition = "TEXT")
    private String surgeonNotes;

    @Column(name = "complications", columnDefinition = "TEXT")
    private String complications;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
