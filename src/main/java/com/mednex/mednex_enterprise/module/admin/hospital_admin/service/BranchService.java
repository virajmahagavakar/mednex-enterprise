package com.mednex.mednex_enterprise.module.admin.hospital_admin.service;

import com.mednex.mednex_enterprise.module.admin.hospital_admin.dto.BranchRequest;
import com.mednex.mednex_enterprise.module.admin.hospital_admin.dto.BranchResponse;
import com.mednex.mednex_enterprise.core.entity.Branch;
import com.mednex.mednex_enterprise.core.repository.BranchRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.core.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;

    @Transactional("tenantTransactionManager")
    public BranchResponse createBranch(BranchRequest request) {
        // Here we could add logic to check if a branch code already exists, etc.
        // For now, let's keep it simple.

        Branch branch = Branch.builder()
                .name(request.getName())
                .code(request.getCode())
                .address(request.getAddress())
                .active(true)
                .build();

        Branch savedBranch = branchRepository.save(branch);

        return mapToResponse(savedBranch);
    }

    @Transactional(readOnly = true)
    public List<BranchResponse> getAllBranches() {
        String currentAdminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        boolean isHospitalAdmin = currentAdmin.getRoles().stream().anyMatch(r -> r.getName().equals("HOSPITAL_ADMIN"));

        List<Branch> branches;
        if (isHospitalAdmin) {
            branches = branchRepository.findAll();
        } else {
            java.util.Set<Branch> userBranches = new java.util.HashSet<>(currentAdmin.getBranches());
            if (currentAdmin.getPrimaryBranch() != null) {
                userBranches.add(currentAdmin.getPrimaryBranch());
            }
            branches = new java.util.ArrayList<>(userBranches);
        }

        return branches.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional("tenantTransactionManager")
    public void removeBranchAdmin(java.util.UUID branchId) {
        List<User> admins = userRepository.findBranchAdminsByBranchId(branchId);
        if (!admins.isEmpty()) {
            for (User admin : admins) {
                // Remove the branch admin role or delete the user entirely?
                // Depending on the use case. If they only belong to this branch, we deactivate
                // them or delete them.
                // Since this app seems to onboard a staff *strictly* for a branch, deleting the
                // role or setting active=false is better.
                admin.setActive(false);
                admin.getRoles().clear();
                userRepository.save(admin);
            }
        }
    }

    private BranchResponse mapToResponse(Branch branch) {
        BranchResponse.BranchResponseBuilder builder = BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .code(branch.getCode())
                .address(branch.getAddress())
                .active(branch.isActive())
                .createdAt(branch.getCreatedAt());

        // Find the Branch Admin for this branch
        List<User> admins = userRepository.findBranchAdminsByBranchId(branch.getId());
        if (!admins.isEmpty()) {
            User admin = admins.get(0); // Assuming one branch admin per branch for now
            builder.branchAdminId(admin.getId());
            builder.branchAdminName(admin.getName());
            builder.branchAdminEmail(admin.getEmail());
        }

        return builder.build();
    }
}
