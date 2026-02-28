package com.mednex.mednex_enterprise.admin.service;

import com.mednex.mednex_enterprise.admin.dto.BranchRequest;
import com.mednex.mednex_enterprise.admin.dto.BranchResponse;
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

    private BranchResponse mapToResponse(Branch branch) {
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .code(branch.getCode())
                .address(branch.getAddress())
                .active(branch.isActive())
                .createdAt(branch.getCreatedAt())
                .build();
    }
}
