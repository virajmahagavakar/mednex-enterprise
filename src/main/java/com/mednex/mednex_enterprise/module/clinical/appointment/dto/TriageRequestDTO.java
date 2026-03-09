package com.mednex.mednex_enterprise.module.clinical.appointment.dto;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import lombok.Data;

<<<<<<< HEAD
=======
import java.time.LocalDateTime;
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
import java.util.UUID;

@Data
public class TriageRequestDTO {
    private UUID doctorId;
<<<<<<< HEAD
=======
    private LocalDateTime appointmentTime;
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
    private UrgencyLevel urgencyLevel;
    private String notes;
}
