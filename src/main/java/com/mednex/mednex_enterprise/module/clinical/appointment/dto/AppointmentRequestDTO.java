package com.mednex.mednex_enterprise.module.clinical.appointment.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequestDTO {
    private String symptoms;
    private String problemDescription;
    private LocalDate preferredDate;
    private UrgencyLevel urgencyLevel;
    private String departmentPreference;
}
