// Authentication Types
export interface AuthRequest {
    email: string;
    password?: string;
    hospitalId?: string; // To identify the tenant context
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    hospitalId: string;
}

export interface RefreshRequest {
    refreshToken: string;
}

// Onboarding Types
export interface HospitalRegistrationRequest {
    hospitalName: string;
    licenseNumber: string;
    gst: string;
    countryState: string;
    primaryEmail: string;
    adminName: string;
    password?: string;
    subscriptionPlan: string;
    subscriptionDuration: string;
    parentTenantId?: string;
}

// Branch Management Types
export interface BranchRequest {
    name: string;
    code?: string;
    address?: string;
}

export interface BranchResponse {
    id: string; // UUID
    name: string;
    code: string;
    address: string;
    tenantId: string;
    active: boolean;
    createdAt: string;
}

// Admin Profile Types
export interface ProfileResponse {
    name: string;
    email: string;
    contactNumber: string;
    roles: string[];
    active: boolean;
}

export interface ProfileRequest {
    name: string;
    contactNumber: string;
}

// Staff & Role Management Types
export interface RoleResponse {
    id: number;
    name: string;
    description: string;
}

export interface StaffProfileDTO {
    nationalIdNumber: string;
    residentialAddress: string;
    bloodGroup?: string;
    emergencyContactNumber?: string;
    medicalLicenseNumber?: string;
    qualification?: string;
    specialization?: string;
    subSpecialty?: string;
    yearsOfExperience?: number;
    defaultConsultationFee?: number;
    biography?: string;
}

export interface StaffRegistrationRequest {
    name: string;
    email: string;
    password?: string; // Temporary password
    primaryBranchId?: string; // UUID
    branches: string[]; // Set of UUIDs
    roleIds: number[]; // Set of Longs
    profileDetails?: StaffProfileDTO;
}

export interface StaffResponse {
    id: string; // UUID
    name: string;
    email: string;
    status: string;
    roles: RoleResponse[];
    profileDetails?: StaffProfileDTO;
}

// Subscription Types
export interface SubscriptionRequest {
    duration: 'MONTHLY' | 'YEARLY';
}

export interface SubscriptionResponse {
    hospitalName: string;
    plan: string;
    duration: string;
    costPaid: number;
    expiryDate: string;
    daysLeft: number;
    discountApplied: boolean;
}
