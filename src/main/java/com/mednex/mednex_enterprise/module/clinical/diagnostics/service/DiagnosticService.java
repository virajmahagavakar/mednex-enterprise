package com.mednex.mednex_enterprise.module.clinical.diagnostics.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.AppointmentRepository;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.dto.DiagnosticOrderRequest;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.dto.DiagnosticResultUploadRequest;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.entity.*;
import com.mednex.mednex_enterprise.module.clinical.diagnostics.repository.*;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiagnosticService {

    private final DiagnosticTestCatalogRepository catalogRepository;
    private final DiagnosticOrderRepository orderRepository;
    private final DiagnosticOrderLineItemRepository lineItemRepository;
    private final DiagnosticResultRepository resultRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public List<DiagnosticTestCatalog> getAllActiveTests() {
        return catalogRepository.findByActiveTrue();
    }

    public List<DiagnosticTestCatalog> getTestsByType(TestType type) {
        return catalogRepository.findByTypeAndActiveTrue(type);
    }

    @Transactional
    public DiagnosticOrder createOrder(DiagnosticOrderRequest request, String doctorUsername) {
        User doctor = userRepository.findByEmail(doctorUsername)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        DiagnosticOrder order = DiagnosticOrder.builder()
                .orderNumber("ORD-" + System.currentTimeMillis())
                .patient(patient)
                .appointment(appointment)
                .orderingDoctor(doctor)
                .clinicalNotes(request.getClinicalNotes())
                .status(OrderStatus.PENDING)
                .build();

        for (UUID catalogId : request.getTestCatalogIds()) {
            DiagnosticTestCatalog catalogItem = catalogRepository.findById(catalogId)
                    .orElseThrow(() -> new RuntimeException("Test catalog item not found: " + catalogId));

            DiagnosticOrderLineItem lineItem = DiagnosticOrderLineItem.builder()
                    .catalogItem(catalogItem)
                    .status(OrderStatus.PENDING)
                    .build();
            order.addLineItem(lineItem);
        }

        return orderRepository.save(order);
    }

    public List<DiagnosticOrder> getPatientOrders(UUID patientId) {
        return orderRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<DiagnosticOrderLineItem> getPendingWorklist(TestType type) {
        return lineItemRepository.findByStatusAndCatalogItemType(OrderStatus.PENDING, type);
    }

    @Transactional
    public DiagnosticResult uploadResult(UUID lineItemId, DiagnosticResultUploadRequest request, String techUsername) {
        DiagnosticOrderLineItem lineItem = lineItemRepository.findById(lineItemId)
                .orElseThrow(() -> new RuntimeException("Order line item not found"));

        if (lineItem.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Result already uploaded for this item.");
        }

        User technician = userRepository.findByEmail(techUsername)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        DiagnosticResult result = DiagnosticResult.builder()
                .orderLineItem(lineItem)
                .resultValue(request.getResultValue())
                .referenceRange(lineItem.getCatalogItem().getDefaultReferenceRange())
                .interpretationFlag(request.getInterpretationFlag())
                .remarks(request.getRemarks())
                .dicomStudyUid(request.getDicomStudyUid())
                .dicomSeriesUid(request.getDicomSeriesUid())
                .documentUrl(request.getDocumentUrl())
                .reportedBy(technician)
                .resultDate(LocalDateTime.now())
                .build();

        lineItem.setResult(result);
        lineItem.setStatus(OrderStatus.COMPLETED);

        // Check if main order is fully completed
        DiagnosticOrder order = lineItem.getOrder();
        boolean allComplete = order.getLineItems().stream()
                .allMatch(item -> item.getStatus() == OrderStatus.COMPLETED);

        if (allComplete) {
            order.setStatus(OrderStatus.COMPLETED);
        } else {
            order.setStatus(OrderStatus.PARTIALLY_COMPLETED);
        }

        orderRepository.save(order);
        return resultRepository.save(result);
    }
}
