package com.mednex.mednex_enterprise.module.clinical.patient.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
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
public class PatientAppointmentResponseDTO {
    private UUID id;
    private UUID doctorId;
    private String doctorName;
    private String specialization;
    private LocalDateTime appointmentTime;
    private LocalDateTime preferredDate;
    private String department;
    private AppointmentStatus status;
    private String reasonForVisit;
    private String notes;
    private String prescription;
    private Integer tokenNumber;
    private Boolean isWalkIn;
}
