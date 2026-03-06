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

export interface PatientRegistrationRequest {
    hospitalId: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phoneNumber: string;
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
    branchAdminId?: string;
    branchAdminName?: string;
    branchAdminEmail?: string;
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
    active: boolean;
    primaryBranchId?: string;
    branches?: string[];
    roles: string[];
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

// Doctor Clinical Types
export interface DoctorDashboardStatsDTO {
    totalPatients: number;
    todayAppointments: number;
    upcomingAppointments: number;
    pendingPrescriptions: number;
}

export interface AppointmentResponse {
    id: string; // UUID
    patientId: string;
    patientName: string;
    appointmentTime: string; // ISO DateTime string
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    reasonForVisit?: string;
    notes?: string;
}

export interface AppointmentUpdateRequest {
    status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    prescription?: string;
}

export interface PatientResponse {
    id: string; // UUID
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    dateOfBirth: string; // ISO Date string
    gender: string;
    bloodGroup?: string;
    medicalHistory?: string;
}

// Nurse Clinical Types
export interface NurseDashboardStatsDTO {
    waitingRoomCount: number;
    todayAppointments: number;
    criticalCases: number;
    triagedToday: number;
}

export interface TriageRequest {
    vitalsSnapshot?: string;
    initialNotes?: string;
    markAsReady: boolean;
}

// Patient Clinical Types
export interface PatientDashboardStatsDTO {
    upcomingAppointments: number;
    pendingPrescriptions: number;
    recentLabResults: number;
    unreadMessages: number;
}

export interface PatientProfileDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalHistory?: string;
}

export interface PatientProfileUpdateDTO {
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalHistory?: string;
}

export interface DoctorInfoDTO {
    id: string; // UUID
    name: string;
    specialization: string;
    qualification: string;
    yearsOfExperience: number;
    defaultConsultationFee: number;
}

export interface AvailableSlotDTO {
    time: string; // ISO DateTime string
    available: boolean;
}

export interface AppointmentBookingRequest {
    doctorId: string; // UUID
    appointmentTime: string; // ISO DateTime string
    reasonForVisit?: string;
}

export interface PatientAppointmentResponseDTO {
    id: string; // UUID
    doctorId: string;
    doctorName: string;
    specialization: string;
    appointmentTime: string; // ISO DateTime string
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    reasonForVisit?: string;
    notes?: string;
    prescription?: string;
}

// Pharmacy Types
export interface MedicineDTO {
    id: string; // UUID
    name: string;
    genericName: string;
    category: string;
    manufacturer: string;
    unit: string;
    minimumStockLevel: number;
    requiresPrescription: boolean;
    isActive: boolean;
    currentStock: number;
}

export interface SupplierDTO {
    id: string; // UUID
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    isActive: boolean;
}

export interface InventoryBatchDTO {
    id: string; // UUID
    medicineId: string;
    medicineName: string;
    supplierId: string;
    supplierName: string;
    batchNumber: string;
    quantityAvailable: number;
    expiryDate: string; // ISO Date "YYYY-MM-DD"
    unitSellingPrice: number;
    status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
}

export interface BatchReceiptRequest {
    medicineId: string;
    supplierId: string;
    batchNumber: string;
    quantityReceived: number;
    manufacturingDate?: string; // ISO Date "YYYY-MM-DD"
    expiryDate: string; // ISO Date "YYYY-MM-DD"
    unitCostPrice: number;
    unitSellingPrice: number;
}

export interface DispensedItemDTO {
    id: string; // UUID
    medicineId: string;
    medicineName: string;
    inventoryBatchId?: string;
    batchNumber?: string;
    prescribedQuantity: number;
    dispensedQuantity: number;
    dosageInstructions?: string;
    unitPrice: number;
    totalPrice: number;
    discountPercent: number;
}

export interface PharmacyPrescriptionDTO {
    id: string; // UUID
    patientName: string;
    doctorName: string;
    appointmentId?: string;
    prescriptionDate: string; // ISO DateTime
    status: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'CANCELLED';
    totalAmount: number;
    paymentStatus: 'UNPAID' | 'PAID';
    items: DispensedItemDTO[];
}

export interface DispenseItemRequest {
    dispensedItemId: string; // UUID
    inventoryBatchId: string; // UUID
    quantityToDispense: number;
    discountPercent?: number;
}

export interface DispenseRequest {
    items: DispenseItemRequest[];
    paymentStatus?: 'UNPAID' | 'PAID';
}

export interface PharmacyDashboardStatsDTO {
    totalMedicines: number;
    lowStockAlerts: number;
    expiringSoonAlerts: number;
    pendingPrescriptions: number;
    todayRevenue: number;
}

// Prescription Creation (Doctor to Pharmacy)
export interface CreatePrescriptionItemRequest {
    medicineId: string;
    prescribedQuantity: number;
    dosageInstructions?: string;
}

export interface CreatePrescriptionRequest {
    patientId: string;
    appointmentId?: string;
    items: CreatePrescriptionItemRequest[];
}
