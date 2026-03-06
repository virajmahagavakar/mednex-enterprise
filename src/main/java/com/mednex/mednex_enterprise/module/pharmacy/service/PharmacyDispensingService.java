package com.mednex.mednex_enterprise.module.pharmacy.service;

import com.mednex.mednex_enterprise.module.pharmacy.dto.DispenseRequest;
import com.mednex.mednex_enterprise.module.pharmacy.dto.DispensedItemDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.PharmacyDashboardStatsDTO;
import com.mednex.mednex_enterprise.module.pharmacy.dto.PharmacyPrescriptionDTO;
import com.mednex.mednex_enterprise.module.pharmacy.entity.DispensedItem;
import com.mednex.mednex_enterprise.module.pharmacy.entity.InventoryBatch;
import com.mednex.mednex_enterprise.module.pharmacy.entity.PharmacyPrescription;
import com.mednex.mednex_enterprise.module.pharmacy.exception.PharmacyServiceException;
import com.mednex.mednex_enterprise.module.pharmacy.repository.DispensedItemRepository;
import com.mednex.mednex_enterprise.module.pharmacy.repository.InventoryBatchRepository;
import com.mednex.mednex_enterprise.module.pharmacy.repository.MedicineRepository;
import com.mednex.mednex_enterprise.module.pharmacy.repository.PharmacyPrescriptionRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.pharmacy.dto.CreatePrescriptionRequest;
import com.mednex.mednex_enterprise.module.pharmacy.dto.CreatePrescriptionItemRequest;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.pharmacy.entity.Medicine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyDispensingService {

    private final PharmacyPrescriptionRepository prescriptionRepository;
    private final DispensedItemRepository dispensedItemRepository;
    private final InventoryBatchRepository batchRepository;
    private final MedicineRepository medicineRepository;
    private final PharmacyInventoryService inventoryService;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PharmacyPrescriptionDTO> getPendingPrescriptions() {
        return prescriptionRepository.findByStatus(PharmacyPrescription.PrescriptionStatus.PENDING)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PharmacyPrescriptionDTO createPrescription(UUID doctorId, CreatePrescriptionRequest request) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new PharmacyServiceException("Doctor not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new PharmacyServiceException("Patient not found"));

        PharmacyPrescription prescription = PharmacyPrescription.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentId(request.getAppointmentId())
                .status(PharmacyPrescription.PrescriptionStatus.PENDING)
                .paymentStatus(PharmacyPrescription.PaymentStatus.UNPAID)
                .build();

        for (CreatePrescriptionItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new PharmacyServiceException("Medicine not found"));

            DispensedItem item = DispensedItem.builder()
                    .prescription(prescription)
                    .medicine(medicine)
                    .prescribedQuantity(itemReq.getPrescribedQuantity())
                    .dispensedQuantity(0)
                    .dosageInstructions(itemReq.getDosageInstructions())
                    .totalPrice(BigDecimal.ZERO)
                    .build();

            prescription.addDispensedItem(item);
        }

        return mapToDto(prescriptionRepository.save(prescription));
    }

    @Transactional
    public PharmacyPrescriptionDTO fulfillPrescription(UUID prescriptionId, DispenseRequest request) {
        PharmacyPrescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new PharmacyServiceException("Prescription not found"));

        if (prescription.getStatus() == PharmacyPrescription.PrescriptionStatus.DISPENSED ||
                prescription.getStatus() == PharmacyPrescription.PrescriptionStatus.CANCELLED) {
            throw new PharmacyServiceException("Prescription is already dispensed or cancelled");
        }

        BigDecimal totalBillAmount = BigDecimal.ZERO;
        boolean allFullyDispensed = true;

        for (DispenseRequest.DispenseItemRequest itemReq : request.getItems()) {
            DispensedItem dispensedItem = dispensedItemRepository.findById(itemReq.getDispensedItemId())
                    .orElseThrow(() -> new PharmacyServiceException("Dispensed item record not found"));

            if (!dispensedItem.getPrescription().getId().equals(prescriptionId)) {
                throw new PharmacyServiceException("Item does not belong to this prescription");
            }

            InventoryBatch batch = batchRepository.findById(itemReq.getInventoryBatchId())
                    .orElseThrow(() -> new PharmacyServiceException("Batch not found"));

            // Validate batch and medicine match
            if (!batch.getMedicine().getId().equals(dispensedItem.getMedicine().getId())) {
                throw new PharmacyServiceException("Batch does not match prescribed medicine");
            }

            // Validate expiry
            if (batch.getExpiryDate().isBefore(LocalDate.now())) {
                throw new PharmacyServiceException("Cannot dispense from expired batch: " + batch.getBatchNumber());
            }

            // Validate quantity
            int requestedQty = itemReq.getQuantityToDispense();
            if (batch.getQuantityAvailable() < requestedQty) {
                throw new PharmacyServiceException("Insufficient stock in batch " + batch.getBatchNumber());
            }

            // Deduct stock
            batch.setQuantityAvailable(batch.getQuantityAvailable() - requestedQty);
            if (batch.getQuantityAvailable() == 0) {
                batch.setStatus(InventoryBatch.BatchStatus.DEPLETED);
            }
            batchRepository.save(batch);

            // Update dispensed item
            dispensedItem.setInventoryBatch(batch);
            dispensedItem.setDispensedQuantity(dispensedItem.getDispensedQuantity() + requestedQty);
            dispensedItem.setUnitPrice(batch.getUnitSellingPrice());

            BigDecimal discount = itemReq.getDiscountPercent() != null ? itemReq.getDiscountPercent() : BigDecimal.ZERO;
            dispensedItem.setDiscountPercent(discount);

            // Calculate price: (Selling Price * Qty) * (1 - Discount/100)
            BigDecimal rawTotal = batch.getUnitSellingPrice().multiply(BigDecimal.valueOf(requestedQty));
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(discount.divide(BigDecimal.valueOf(100)));
            BigDecimal finalPrice = rawTotal.multiply(discountMultiplier);

            dispensedItem.setTotalPrice(finalPrice);
            totalBillAmount = totalBillAmount.add(finalPrice);

            // Check if this item is completely fulfilled
            if (dispensedItem.getDispensedQuantity() < dispensedItem.getPrescribedQuantity()) {
                allFullyDispensed = false;
            }
        }

        // Update Prescription Status
        prescription.setTotalAmount(prescription.getTotalAmount() == null ? totalBillAmount
                : prescription.getTotalAmount().add(totalBillAmount));
        prescription.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus()
                : PharmacyPrescription.PaymentStatus.UNPAID);

        if (allFullyDispensed) {
            prescription.setStatus(PharmacyPrescription.PrescriptionStatus.DISPENSED);
        } else {
            prescription.setStatus(PharmacyPrescription.PrescriptionStatus.PARTIALLY_DISPENSED);
        }

        return mapToDto(prescriptionRepository.save(prescription));
    }

    @Transactional(readOnly = true)
    public PharmacyDashboardStatsDTO getDashboardStats() {
        long totalMedicines = medicineRepository.count();
        int pendingPrescriptions = prescriptionRepository.findByStatus(PharmacyPrescription.PrescriptionStatus.PENDING)
                .size();

        // Use existing methods from inventory service
        int lowStockCount = inventoryService.getLowStockMedicines().size();
        int expiringSoonCount = inventoryService.getExpiringSoonBatches(30).size(); // Alert for 30 days

        // Calculate today's revenue
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        // Basic revenue calculation (would need a more specific query in a real app,
        // summing only today's dispensed items)
        BigDecimal todayRevenue = BigDecimal.ZERO; // Placeholder for now

        return PharmacyDashboardStatsDTO.builder()
                .totalMedicines(totalMedicines)
                .pendingPrescriptions(pendingPrescriptions)
                .lowStockAlerts(lowStockCount)
                .expiringSoonAlerts(expiringSoonCount)
                .todayRevenue(todayRevenue)
                .build();
    }

    // --- MAPPERS ---

    private PharmacyPrescriptionDTO mapToDto(PharmacyPrescription entity) {
        return PharmacyPrescriptionDTO.builder()
                .id(entity.getId())
                .patientName(entity.getPatient() != null
                        ? entity.getPatient().getFirstName() + " " + entity.getPatient().getLastName()
                        : "Walk-in")
                .doctorName(entity.getDoctor() != null ? entity.getDoctor().getName() : "N/A")
                .appointmentId(entity.getAppointmentId())
                .prescriptionDate(entity.getPrescriptionDate())
                .status(entity.getStatus())
                .totalAmount(entity.getTotalAmount())
                .paymentStatus(entity.getPaymentStatus())
                .items(entity.getDispensedItems().stream().map(this::mapToDto).collect(Collectors.toList()))
                .build();
    }

    private DispensedItemDTO mapToDto(DispensedItem entity) {
        return DispensedItemDTO.builder()
                .id(entity.getId())
                .medicineId(entity.getMedicine().getId())
                .medicineName(entity.getMedicine().getName())
                .inventoryBatchId(entity.getInventoryBatch() != null ? entity.getInventoryBatch().getId() : null)
                .batchNumber(entity.getInventoryBatch() != null ? entity.getInventoryBatch().getBatchNumber() : null)
                .prescribedQuantity(entity.getPrescribedQuantity())
                .dispensedQuantity(entity.getDispensedQuantity())
                .dosageInstructions(entity.getDosageInstructions())
                .unitPrice(entity.getUnitPrice())
                .totalPrice(entity.getTotalPrice())
                .discountPercent(entity.getDiscountPercent())
                .build();
    }
}
