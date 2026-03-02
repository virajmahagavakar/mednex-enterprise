package com.mednex.mednex_enterprise.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest {

    @NotBlank(message = "Subscription duration is required.")
    @Pattern(regexp = "^(MONTHLY|YEARLY)$", message = "Duration must be either MONTHLY or YEARLY")
    private String duration;

}
