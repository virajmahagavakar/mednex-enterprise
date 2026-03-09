package com.mednex.mednex_enterprise.module.clinical.appointment.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponseDTO {
    private UUID id;
    private PatientResponseDTO patient;
    private DoctorInfoDTO doctor;
    private LocalDateTime appointmentTime;
    private AppointmentStatus status;
    private UrgencyLevel urgencyLevel;
    private Integer tokenNumber;
    private Boolean isWalkIn;
    private String reasonForVisit;
    private String symptoms;
    private String problemDescription;
    private String departmentPreference;
    private LocalDateTime preferredDate;
    private String notes;
    private String prescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
