package com.mednex.mednex_enterprise.module.clinical.ambulance.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.ambulance.dto.AmbulanceRequestDTO;
import com.mednex.mednex_enterprise.module.clinical.ambulance.dto.AmbulanceResponseDTO;
import com.mednex.mednex_enterprise.module.clinical.ambulance.entity.AmbulanceRequest;
import com.mednex.mednex_enterprise.module.clinical.ambulance.entity.AmbulanceStatus;
import com.mednex.mednex_enterprise.module.clinical.ambulance.repository.AmbulanceRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final PatientService patientService;

    @Transactional
    public AmbulanceResponseDTO createRequest(User currentUser, AmbulanceRequestDTO dto) {
        Patient patient = patientService.getOrCreatePatient(currentUser);

        AmbulanceRequest request = AmbulanceRequest.builder()
                .patient(patient)
                .address(dto.getAddress())
                .emergencyType(dto.getEmergencyType())
                .phoneNumber(dto.getPhoneNumber())
                .status(AmbulanceStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        return mapToResponseDTO(ambulanceRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<AmbulanceResponseDTO> getActiveRequests() {
        return ambulanceRepository.findByStatusInWithPatient(
                List.of(AmbulanceStatus.PENDING, AmbulanceStatus.DISPATCHED))
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AmbulanceResponseDTO dispatchAmbulance(UUID id) {
        AmbulanceRequest request = ambulanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        
        request.setStatus(AmbulanceStatus.DISPATCHED);
        request.setDispatchedAt(LocalDateTime.now());
        return mapToResponseDTO(ambulanceRepository.save(request));
    }

    @Transactional
    public AmbulanceResponseDTO completeRequest(UUID id) {
        AmbulanceRequest request = ambulanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        
        request.setStatus(AmbulanceStatus.COMPLETED);
        request.setCompletedAt(LocalDateTime.now());
        return mapToResponseDTO(ambulanceRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<AmbulanceResponseDTO> getPatientRequests(User currentUser) {
        Patient patient = patientService.getOrCreatePatient(currentUser);
        return ambulanceRepository.findByPatientIdOrderByRequestedAtDesc(patient.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private AmbulanceResponseDTO mapToResponseDTO(AmbulanceRequest entity) {
        return AmbulanceResponseDTO.builder()
                .id(entity.getId())
                .patientId(entity.getPatient().getId())
                .patientName(entity.getPatient().getFirstName() + " " + entity.getPatient().getLastName())
                .address(entity.getAddress())
                .emergencyType(entity.getEmergencyType())
                .phoneNumber(entity.getPhoneNumber())
                .requestedAt(entity.getRequestedAt())
                .status(entity.getStatus())
                .dispatchedAt(entity.getDispatchedAt())
                .completedAt(entity.getCompletedAt())
                .build();
    }
}
