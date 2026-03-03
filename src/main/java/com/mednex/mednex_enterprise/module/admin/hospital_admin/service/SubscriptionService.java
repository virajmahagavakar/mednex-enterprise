package com.mednex.mednex_enterprise.admin.service;

import com.mednex.mednex_enterprise.admin.dto.SubscriptionResponse;
import com.mednex.mednex_enterprise.multitenancy.context.TenantContext;
import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
import com.mednex.mednex_enterprise.multitenancy.master.TenantRepository;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.entity.Branch;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.core.repository.BranchRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;

    public SubscriptionResponse getSubscriptionStatus() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        boolean isHospitalAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().equals("HOSPITAL_ADMIN"));

        long daysLeft = 0;

        if (isHospitalAdmin) {
            String currentTenantId = TenantContext.getCurrentTenant();
            if (currentTenantId == null)
                throw new RuntimeException("No tenant context found");

            Tenant tenant = tenantRepository.findById(currentTenantId)
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));

            if (tenant.getSubscriptionEndDate() != null) {
                daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), tenant.getSubscriptionEndDate());
            }

            return SubscriptionResponse.builder()
                    .hospitalName(tenant.getHospitalName())
                    .plan(tenant.getSubscriptionPlan())
                    .duration(tenant.getSubscriptionDuration())
                    .costPaid(tenant.getSubscriptionCost())
                    .expiryDate(tenant.getSubscriptionEndDate())
                    .daysLeft(Math.max(daysLeft, 0))
                    .discountApplied(false)
                    .build();
        } else {
            Branch primaryBranch = currentUser.getPrimaryBranch();
            if (primaryBranch == null)
                throw new RuntimeException("Branch Admin has no primary branch");

            if (primaryBranch.getSubscriptionEndDate() != null) {
                daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), primaryBranch.getSubscriptionEndDate());
            }

            return SubscriptionResponse.builder()
                    .hospitalName(primaryBranch.getName() + " (Sub-Branch)")
                    .plan(primaryBranch.getSubscriptionPlan() != null ? primaryBranch.getSubscriptionPlan()
                            : "Free Trial")
                    .duration(primaryBranch.getSubscriptionDuration() != null ? primaryBranch.getSubscriptionDuration()
                            : "N/A")
                    .costPaid(primaryBranch.getSubscriptionCost())
                    .expiryDate(primaryBranch.getSubscriptionEndDate())
                    .daysLeft(Math.max(daysLeft, 0))
                    .discountApplied(true) // Branch Admins always get 30% discount
                    .build();
        }
    }

    public SubscriptionResponse renewSubscription(String newDuration) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        boolean isHospitalAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().equals("HOSPITAL_ADMIN"));

        double baseCost = "YEARLY".equalsIgnoreCase(newDuration) ? 1000.0 : 100.0;
        LocalDateTime now = LocalDateTime.now();

        if (isHospitalAdmin) {
            String currentTenantId = TenantContext.getCurrentTenant();
            Tenant tenant = tenantRepository.findById(currentTenantId).orElseThrow();

            LocalDateTime referenceDate = (tenant.getSubscriptionEndDate() != null
                    && tenant.getSubscriptionEndDate().isAfter(now))
                            ? tenant.getSubscriptionEndDate()
                            : now;
            LocalDateTime newEndDate = "YEARLY".equalsIgnoreCase(newDuration) ? referenceDate.plusYears(1)
                    : referenceDate.plusMonths(1);

            tenant.setSubscriptionDuration(newDuration.toUpperCase());
            tenant.setSubscriptionEndDate(newEndDate);
            tenant.setSubscriptionCost(baseCost);
            tenant.setUpdatedAt(now);
            tenantRepository.save(tenant);
        } else {
            Branch primaryBranch = currentUser.getPrimaryBranch();
            if (primaryBranch == null)
                throw new RuntimeException("Branch Admin has no primary branch");

            double discountedCost = baseCost * 0.70; // 30% Off for sub-branches

            LocalDateTime referenceDate = (primaryBranch.getSubscriptionEndDate() != null
                    && primaryBranch.getSubscriptionEndDate().isAfter(now))
                            ? primaryBranch.getSubscriptionEndDate()
                            : now;
            LocalDateTime newEndDate = "YEARLY".equalsIgnoreCase(newDuration) ? referenceDate.plusYears(1)
                    : referenceDate.plusMonths(1);

            primaryBranch.setSubscriptionDuration(newDuration.toUpperCase());
            primaryBranch.setSubscriptionEndDate(newEndDate);
            primaryBranch.setSubscriptionCost(discountedCost);
            primaryBranch.setSubscriptionPlan("ENTERPRISE"); // Assuming default plan name
            branchRepository.save(primaryBranch);
        }

        return getSubscriptionStatus();
    }
}
