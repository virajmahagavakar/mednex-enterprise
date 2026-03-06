package com.mednex.mednex_enterprise.module.clinical.diagnostics.entity;
import com.mednex.mednex_enterprise.core.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "diagnostic_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_line_item_id", nullable = false, unique = true)
    private DiagnosticOrderLineItem orderLineItem;

    @Column(name = "result_value", columnDefinition = "TEXT")
    private String resultValue;

    @Column(name = "reference_range")
    private String referenceRange;

    @Column(name = "interpretation_flag")
    private String interpretationFlag; // e.g. HIGH, LOW, NORMAL, ABNORMAL

    // Radiology Specific Metadata (DICOM Simulation)
    @Column(name = "dicom_study_uid")
    private String dicomStudyUid;

    @Column(name = "dicom_series_uid")
    private String dicomSeriesUid;

    @Column(name = "document_url")
    private String documentUrl; // Path to PDF report or static image

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id")
    private User reportedBy; // Lab Tech or Radiologist

    @Column(name = "result_date")
    private LocalDateTime resultDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
