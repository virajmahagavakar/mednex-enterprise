package com.mednex.mednex_enterprise.admin.service;

import com.mednex.mednex_enterprise.admin.dto.BranchRequest;
import com.mednex.mednex_enterprise.admin.dto.BranchResponse;
import com.mednex.mednex_enterprise.core.entity.Branch;
import com.mednex.mednex_enterprise.core.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

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

    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll()
                .stream()
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

