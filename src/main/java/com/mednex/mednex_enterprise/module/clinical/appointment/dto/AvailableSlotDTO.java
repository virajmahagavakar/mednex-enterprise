package com.mednex.mednex_enterprise.module.clinical.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableSlotDTO {
    private LocalDateTime time;
    private boolean available;
}
