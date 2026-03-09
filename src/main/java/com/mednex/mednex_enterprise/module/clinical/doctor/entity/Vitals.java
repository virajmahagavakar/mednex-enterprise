package com.mednex.mednex_enterprise.module.clinical.doctor.entity;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Admission;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vitals {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    private String temperature;

    @Column(name = "heart_rate")
    private String heartRate;

    @Column(name = "respiratory_rate")
    private String respiratoryRate;

    @Column(name = "oxygen_saturation")
    private String oxygenSaturation;

    private String height;
    private String weight;
    private String bmi;

    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }
}
