package com.mednex.mednex_enterprise.module.clinical.surgery.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "operation_theatres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationTheatre {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String location; // e.g., Floor 2, North Wing

    @Column(name = "equipment_notes", columnDefinition = "TEXT")
    private String equipmentNotes;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
