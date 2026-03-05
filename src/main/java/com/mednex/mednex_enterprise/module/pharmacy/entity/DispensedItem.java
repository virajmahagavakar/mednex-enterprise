package com.mednex.mednex_enterprise.module.pharmacy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "dispensed_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispensedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private PharmacyPrescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_batch_id")
    private InventoryBatch inventoryBatch; // Nullable before actually dispensed (e.g., when it's just prescribed by
                                           // doctor)

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "prescribed_quantity", nullable = false)
    private Integer prescribedQuantity; // What the doctor ordered

    @Column(name = "dispensed_quantity", nullable = false)
    @Builder.Default
    private Integer dispensedQuantity = 0; // What the pharmacy actually gave out so far

    @Column(name = "dosage_instructions")
    private String dosageInstructions; // Instructions from doctor (e.g., "1x per day")

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;
}
