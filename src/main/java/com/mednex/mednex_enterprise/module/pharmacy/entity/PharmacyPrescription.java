package com.mednex.mednex_enterprise.module.pharmacy.entity;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pharmacy_prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyPrescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient; // Nullable for direct OTC walk-in sales

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private User doctor; // Optional, User entity handles roles

    @Column(name = "appointment_id")
    private UUID appointmentId; // Link back to the clinical appointment if it originated there

    @Column(name = "prescription_date", nullable = false)
    @Builder.Default
    private LocalDateTime prescriptionDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PrescriptionStatus status = PrescriptionStatus.PENDING;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DispensedItem> dispensedItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addDispensedItem(DispensedItem item) {
        dispensedItems.add(item);
        item.setPrescription(this);
    }

    public enum PrescriptionStatus {
        PENDING,
        PARTIALLY_DISPENSED,
        DISPENSED,
        CANCELLED
    }

    public enum PaymentStatus {
        UNPAID,
        PAID
    }
}
