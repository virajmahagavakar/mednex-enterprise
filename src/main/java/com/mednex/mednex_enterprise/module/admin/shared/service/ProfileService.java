package com.mednex.mednex_enterprise.admin.service;

import com.mednex.mednex_enterprise.admin.dto.ProfileRequest;
import com.mednex.mednex_enterprise.admin.dto.ProfileResponse;
import com.mednex.mednex_enterprise.core.entity.Role;
import com.mednex.mednex_enterprise.core.entity.StaffProfile;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.StaffProfileRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

        private final UserRepository userRepository;
        private final StaffProfileRepository staffProfileRepository;

        @Transactional(readOnly = true)
        public ProfileResponse getProfile() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                // Fetch staff profile to get contact number. May be empty for newly provisioned
                // tenants
                String contactNumber = "";
                var profileOpt = staffProfileRepository.findByUserId(user.getId());
                if (profileOpt.isPresent()) {
                        contactNumber = profileOpt.get().getEmergencyContactNumber();
                }

                Set<String> roles = user.getRoles().stream()
                                .map(Role::getName)
                                .collect(Collectors.toSet());

                return ProfileResponse.builder()
                                .name(user.getName())
                                .email(user.getEmail())
                                .contactNumber(contactNumber)
                                .roles(roles)
                                .active(user.isActive())
                                .build();
        }

        @Transactional
        public ProfileResponse updateProfile(ProfileRequest request) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                // 1. Update Core User Details
                user.setName(request.getName());
                userRepository.save(user);

                // 2. Update Contact Number (StaffProfile)
                StaffProfile profile = staffProfileRepository.findByUserId(user.getId())
                                .orElseGet(() -> StaffProfile.builder()
                                                .user(user)
                                                // If admin doesn't have a profile yet (provisioning), initialize
                                                // required KYC
                                                .nationalIdNumber("PENDING-" + user.getId().toString().substring(0, 8))
                                                .residentialAddress("Pending Address")
                                                .build());

                profile.setEmergencyContactNumber(request.getContactNumber());
                staffProfileRepository.save(profile);

                // Return updated profile
                return getProfile();
        }
}
