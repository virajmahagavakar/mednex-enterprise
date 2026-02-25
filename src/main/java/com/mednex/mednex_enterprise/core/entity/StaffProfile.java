package com.mednex.mednex_enterprise.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "staff_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // --- Core KYC Identity Fields (Applies to everyone) ---
    @Column(name = "national_id_number", nullable = false, unique = true)
    private String nationalIdNumber;

    @Column(name = "residential_address", nullable = false)
    private String residentialAddress;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "emergency_contact_number")
    private String emergencyContactNumber;

    // --- Professional / Clinical Fields (Nullable, only for Doctors/Nurses/Techs)
    // ---
    @Column(name = "medical_license_number", unique = true)
    private String medicalLicenseNumber;

    private String qualification; // e.g., MBBS, MD, B.Sc Nursing

    private String specialization; // e.g., Cardiology, ICU

    @Column(name = "sub_specialty")
    private String subSpecialty;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "default_consultation_fee")
    private BigDecimal defaultConsultationFee; // Only for Consulting Doctors

    @Column(columnDefinition = "TEXT")
    private String biography;
}

