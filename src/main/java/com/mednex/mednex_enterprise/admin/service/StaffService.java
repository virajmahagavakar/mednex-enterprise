package com.mednex.mednex_enterprise.admin.service;

import com.mednex.mednex_enterprise.admin.dto.StaffRegistrationRequest;
import com.mednex.mednex_enterprise.admin.dto.StaffResponse;
import com.mednex.mednex_enterprise.core.entity.Branch;
import com.mednex.mednex_enterprise.core.entity.Role;
import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.BranchRepository;
import com.mednex.mednex_enterprise.core.repository.StaffProfileRepository;
import com.mednex.mednex_enterprise.core.repository.RoleRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StaffResponse onboardStaff(StaffRegistrationRequest request) {
        // 1. Validate email uniqueness
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }

        // 2. Fetch current Authenticated User (Admin)
        String currentAdminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        // 3. Security Check: The current admin can only assign staff to branches they
        // belong to,
        // unless they are a Super Admin or have a global role (For now, check if
        // requested branches are subset of admin's branches)
        boolean isHospitalAdmin = currentAdmin.getRoles().stream().anyMatch(r -> r.getName().equals("HOSPITAL_ADMIN"));

        Set<UUID> adminBranchIds = currentAdmin.getBranches().stream().map(Branch::getId).collect(Collectors.toSet());
        if (currentAdmin.getPrimaryBranch() != null) {
            adminBranchIds.add(currentAdmin.getPrimaryBranch().getId());
        }

        if (!isHospitalAdmin) {
            for (UUID requestedBranchId : request.getBranches()) {
                if (!adminBranchIds.contains(requestedBranchId)) {
                    throw new SecurityException(
                            "You do not have permission to assign staff to branch: " + requestedBranchId);
                }
            }
        }

        // 4. Fetch the branches to assign
        List<Branch> branches = branchRepository.findAllById(request.getBranches());
        if (branches.size() != request.getBranches().size()) {
            throw new IllegalArgumentException("One or more branches not found.");
        }

        // 5. Build Staff User
        User staffUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true) // Should be false until setup in a realistic flow, but keeping true for
                              // immediate testing
                .branches(new HashSet<>(branches))
                .build();

        // Assign primary branch if provided
        if (request.getPrimaryBranchId() != null) {
            Branch primaryBranch = branchRepository.findById(request.getPrimaryBranchId())
                    .orElseThrow(() -> new IllegalArgumentException("Primary branch not found."));
            staffUser.setPrimaryBranch(primaryBranch);
            staffUser.getBranches().add(primaryBranch);
        } else if (!branches.isEmpty()) {
            staffUser.setPrimaryBranch(branches.get(0));
        }

        // 6. Assign Roles
        List<Role> roles = roleRepository.findAllById(request.getRoleIds());
        if (roles.size() != request.getRoleIds().size()) {
            throw new IllegalArgumentException("One or more roles not found.");
        }
        staffUser.setRoles(new HashSet<>(roles));

        // 7. Handle Unified Staff Profile KYC
        if (request.getProfileDetails() == null) {
            throw new IllegalArgumentException(
                    "Staff Profile (KYC) details are mandatory for all hospital stakeholders.");
        }

        var profileDto = request.getProfileDetails();

        // 7a. Global Validations (Aadhaar/SSN must be unique across the hospital)
        if (staffProfileRepository.findByNationalIdNumber(profileDto.getNationalIdNumber()).isPresent()) {
            throw new IllegalArgumentException(
                    "National ID (Aadhaar/SSN) is already registered to another staff member.");
        }

        // 7b. Role-Specific Validations
        boolean isDoctor = roles.stream()
                .anyMatch(role -> role.getName().equals("DOCTOR") || role.getName().equals("SURGEON"));
        boolean isNurseOrTech = roles.stream()
                .anyMatch(role -> role.getName().equals("NURSE") || role.getName().equals("LAB_TECHNICIAN"));

        if (isDoctor || isNurseOrTech) {
            // Mandate Clinical credentials for medical staff
            if (profileDto.getMedicalLicenseNumber() == null || profileDto.getMedicalLicenseNumber().isBlank()) {
                throw new IllegalArgumentException("Medical License Number is required for Clinical Staff.");
            }
            if (profileDto.getQualification() == null || profileDto.getQualification().isBlank()) {
                throw new IllegalArgumentException("Qualification is required for Clinical Staff.");
            }
            if (profileDto.getYearsOfExperience() == null || profileDto.getYearsOfExperience() <= 0) {
                throw new IllegalArgumentException("Valid Years of Experience is required for Clinical Staff.");
            }

            // Uniqueness check for medical license
            if (staffProfileRepository.findByMedicalLicenseNumber(profileDto.getMedicalLicenseNumber()).isPresent()) {
                throw new IllegalArgumentException("Medical License Number is already registered.");
            }
        }

        if (isDoctor) {
            // Mandate Doctor specific fields
            if (profileDto.getSpecialization() == null || profileDto.getSpecialization().isBlank()) {
                throw new IllegalArgumentException("Specialization is required for Doctors/Surgeons.");
            }
            if (profileDto.getDefaultConsultationFee() == null
                    || profileDto.getDefaultConsultationFee().doubleValue() < 0) {
                throw new IllegalArgumentException("Default Consultation Fee is required for Consulting Doctors.");
            }
        }

        // 7c. Save the profile
        StaffProfile profile = StaffProfile.builder()
                .user(staffUser)
                .nationalIdNumber(profileDto.getNationalIdNumber())
                .residentialAddress(profileDto.getResidentialAddress())
                .bloodGroup(profileDto.getBloodGroup())
                .emergencyContactNumber(profileDto.getEmergencyContactNumber())

                // Medical fields (will be null for non-clinical like Cleaners)
                .medicalLicenseNumber(profileDto.getMedicalLicenseNumber())
                .qualification(profileDto.getQualification())
                .specialization(profileDto.getSpecialization())
                .subSpecialty(profileDto.getSubSpecialty())
                .yearsOfExperience(profileDto.getYearsOfExperience())
                .defaultConsultationFee(profileDto.getDefaultConsultationFee())
                .biography(profileDto.getBiography())
                .build();

        staffProfileRepository.save(profile);

        StaffResponse response = mapToResponse(staffUser);
        response.setProfileDetails(request.getProfileDetails());
        return response;
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaff() {
        String currentAdminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        boolean isHospitalAdmin = currentAdmin.getRoles().stream().anyMatch(r -> r.getName().equals("HOSPITAL_ADMIN"));

        List<User> staffMembers;

        if (isHospitalAdmin) {
            staffMembers = userRepository.findAll();
        } else {
            Set<UUID> adminBranchIds = currentAdmin.getBranches().stream().map(Branch::getId)
                    .collect(Collectors.toSet());
            if (currentAdmin.getPrimaryBranch() != null) {
                adminBranchIds.add(currentAdmin.getPrimaryBranch().getId());
            }

            // Filter staff who belong to at least one of the Admin's branches
            staffMembers = userRepository.findAll().stream()
                    .filter(user -> user.getBranches().stream().anyMatch(b -> adminBranchIds.contains(b.getId()))
                            || (user.getPrimaryBranch() != null
                                    && adminBranchIds.contains(user.getPrimaryBranch().getId())))
                    .collect(Collectors.toList());
        }

        return staffMembers.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private StaffResponse mapToResponse(User user) {
        return StaffResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .active(user.isActive())
                .primaryBranchId(user.getPrimaryBranch() != null ? user.getPrimaryBranch().getId() : null)
                .branches(user.getBranches().stream().map(Branch::getId).collect(Collectors.toSet()))
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
