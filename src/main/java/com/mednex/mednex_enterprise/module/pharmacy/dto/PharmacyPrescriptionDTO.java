package com.mednex.mednex_enterprise.module.pharmacy.dto;

import com.mednex.mednex_enterprise.module.pharmacy.entity.PharmacyPrescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyPrescriptionDTO {
    private UUID id;
    private String patientName;
    private String doctorName;
    private UUID appointmentId;
    private LocalDateTime prescriptionDate;
    private PharmacyPrescription.PrescriptionStatus status;
    private BigDecimal totalAmount;
    private PharmacyPrescription.PaymentStatus paymentStatus;
    private List<DispensedItemDTO> items;
}
