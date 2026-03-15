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
    name: string;
    email: string;
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
    branch?: BranchResponse;
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
    waitingQueueCount: number;
    completedToday: number;
    activeIpdPatients: number;
    nextAppointmentTime: string;
    pendingPrescriptions: number;
}

export interface DashboardChartDataDTO {
    date: string;
    patientsSeen: number;
}

export interface DoctorScheduleDTO {
    id?: number;
    dayOfWeek: string;
    startTime: string; // "HH:mm:ss"
    endTime: string;   // "HH:mm:ss"
    slotDuration: number;
    active: boolean;
}

export type AppointmentStatus = 'REQUESTED' | 'TRIAGED' | 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'DENIED' | 'TRANSFERRED';

export interface AppointmentResponse {
    id: string; // UUID
    patientId: string;
    patientName: string;
    appointmentTime: string; // ISO DateTime string
    status: AppointmentStatus;
    reasonForVisit?: string;
    notes?: string;
    tokenNumber?: number;
    isWalkIn?: boolean;
}

export interface PatientResponseDTO {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    gender?: string;
    bloodGroup?: string;
}

export interface Appointment {
    id: string;
    patient: PatientResponseDTO;
    doctor: DoctorInfoDTO | null;
    appointmentTime: string;
    status: AppointmentStatus;
    tokenNumber?: number;
    isWalkIn: boolean;
    reasonForVisit?: string;
    problemDescription?: string;
    symptoms?: string;
    urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'CRITICAL';
    departmentPreference: string | null;
    preferredDate: string | null;
    notes: string | null;
    prescription: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TriageUpdateRequest {
    doctorId?: string;
    departmentId?: string;
    urgencyLevel?: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'CRITICAL';
    appointmentTime?: string;
}

export interface AppointmentUpdateRequest {
    status?: AppointmentStatus;
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

export interface ClinicalNoteDTO {
    id: string; // UUID
    patientId: string;
    appointmentId: string;
    doctorName: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    followUpDate?: string; // ISO DateTime
    createdAt: string; // ISO DateTime
}

export interface CreateClinicalNoteRequest {
    patientId: string;
    appointmentId: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    followUpDate?: string;
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
    totalPrescriptions: number;
    recentLabResults: number;
    unreadMessages: number;
    nextAppointmentDate: string | null;
}

// Ambulance Types
export type AmbulanceStatus = 'PENDING' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export interface AmbulanceRequest {
    address: String;
    emergencyType: String;
    phoneNumber: String;
}

export interface AmbulanceResponse {
    id: string;
    patientId: string;
    patientName: string;
    address: string;
    emergencyType: string;
    phoneNumber: string;
    requestedAt: string;
    status: AmbulanceStatus;
    dispatchedAt?: string;
    completedAt?: string;
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
    symptoms: string;
    problemDescription: string;
    preferredDate?: string; // ISO string
    urgencyLevel?: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'CRITICAL';
    departmentPreference?: string;
    doctorId?: string; // Optional
    appointmentTime?: string; // Optional
}

export interface PatientAppointmentResponseDTO {
    id: string; // UUID
    doctorId?: string;
    doctorName?: string;
    specialization?: string;
    appointmentTime: string; // ISO DateTime string
    preferredDate?: string; // ISO DateTime string
    status: AppointmentStatus;
    tokenNumber?: number;
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

// IPD Management Types
export interface WardDTO {
    id: string; // UUID
    name: string;
    branchId: string;
    totalCapacity: number;
    occupiedBeds: number;
    availableBeds: number;
    createdAt: string; // ISO DateTime
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING_REQUIRED' | 'MAINTENANCE';

export interface BedDTO {
    id: string; // UUID
    wardId: string;
    roomNumber: string;
    bedNumber: string;
    status: BedStatus;
    bedType?: string;
    patient?: {
        name: string;
        diagnosis?: string;
        doctorName?: string;
        admissionDate: string;
    };
    attachedAssets?: {
        id: string;
        name: string;
    }[];
}

export type AdmissionStatus = 'REQUESTED' | 'BED_ASSIGNED' | 'ADMITTED' | 'UNDER_TREATMENT' | 'TRANSFERRED' | 'DISCHARGE_REQUESTED' | 'DISCHARGED';

export interface AdmissionDTO {
    id: string; // UUID
    patientId: string;
    patientName: string;
    admittingDoctorId: string;
    admittingDoctorName: string;
    currentBedId?: string;
    bedNumber?: string;
    wardName?: string;
    admissionDate: string; // ISO DateTime
    dischargeDate?: string; // ISO DateTime
    status: AdmissionStatus;
    reasonForAdmission: string;
    urgencyLevel?: string;
    department?: string;
}

export interface AdmissionRequestDTO {
    patientId: string;
    reasonForAdmission: string;
    urgencyLevel: string;
    department: string;
}

export interface AssignBedRequest {
    bedId: string;
    reasonForAdmission?: string;
}

export interface TransferRequest {
    newBedId: string;
}

export interface AdmissionRequest {
    patientId: string; // UUID
    bedId: string; // UUID
    reasonForAdmission: string;
}

export interface DailyRoundDTO {
    id: string; // UUID
    admissionId: string;
    doctorId: string;
    doctorName: string;
    roundDate: string; // ISO DateTime
    clinicalNotes: string;
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    medicationAdjustment?: string;
    nextStep?: string;
}

export interface DailyRoundRequest {
    clinicalNotes: string;
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    medicationAdjustment?: string;
    nextStep?: string;
}

export interface EquipmentRequestDTO {
    id: string;
    admissionId: string;
    equipmentType: string;
    priority: string;
    status: string;
    notes?: string;
    requestedAt: string;
    providedAt?: string;
    returnedAt?: string;
}

export interface EquipmentRequestAction {
    equipmentType: string;
    priority: string;
    notes?: string;
}

export interface MedicationAdministrationDTO {
    id: string;
    admissionId: string;
    medicineName: string;
    dosage: string;
    route: string;
    administeredById: string;
    administeredByName: string;
    administeredAt: string;
    notes?: string;
}

export interface MedicationAdministrationRequest {
    medicineName: string;
    dosage: string;
    route?: string;
    notes?: string;
}

// Diagnostics Types
export type TestType = 'PATHOLOGY' | 'RADIOLOGY';
export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'PARTIALLY_COMPLETED' | 'COMPLETED' | 'CANCELLED';

export interface DiagnosticTestCatalogDTO {
    id: string;
    testCode: string;
    name: string;
    description: string;
    type: TestType;
    expectedTurnaroundHours: number;
    price: number;
    defaultReferenceRange: string;
    active: boolean;
}

export interface DiagnosticOrderDTO {
    id: string;
    orderNumber: string;
    patientId: string;
    patientName: string;
    orderingDoctorName: string;
    status: OrderStatus;
    clinicalNotes: string;
    createdAt: string;
    lineItems: DiagnosticOrderLineItemDTO[];
}

export interface DiagnosticResultDTO {
    id: string;
    resultValue: string;
    referenceRange: string;
    interpretationFlag: string;
    dicomStudyUid?: string;
    dicomSeriesUid?: string;
    documentUrl?: string;
    remarks: string;
    reportedByName?: string;
    resultDate: string;
}

export interface DiagnosticOrderLineItemDTO {
    id: string;
    catalogItem: DiagnosticTestCatalogDTO;
    status: OrderStatus;
    result?: DiagnosticResultDTO;
    notes: string;
}

export interface DiagnosticOrderRequest {
    patientId: string;
    appointmentId?: string;
    testCatalogIds: string[];
    clinicalNotes: string;
}

export interface DiagnosticResultUploadRequest {
    resultValue?: string;
    interpretationFlag?: string;
    remarks?: string;
    dicomStudyUid?: string;
    dicomSeriesUid?: string;
    documentUrl?: string;
}

// Surgery Types
export type SurgeryStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface OperationTheatreDTO {
    id: string;
    name: string;
    location: string;
    equipmentNotes: string;
    active: boolean;
}

export interface SurgeryScheduleDTO {
    id: string;
    patientName: string;
    procedureName: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    status: SurgeryStatus;
    primarySurgeonName: string;
    anesthetistName?: string;
    theatreId: string;
    theatreName: string;
}

export interface SurgeryScheduleRequest {
    patientId: string;
    theatreId: string;
    procedureName: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    primarySurgeonId: string;
    anesthetistId?: string;
}

export interface SurgicalNoteRequest {
    preOpDiagnosis: string;
    postOpDiagnosis: string;
    operationPerformed: string;
    surgeonNotes: string;
    complications: string;
}

export interface AnesthesiaNoteRequest {
    anesthesiaType: string;
    medicationsAdministered: string;
    patientVitalsSummary: string;
    anesthetistNotes: string;
}
// EMR Types
export interface PatientSummaryDTO {
    id: string; // UUID
    name: string;
    age: number;
    gender: string;
    patientType: 'OPD' | 'IPD';
    lastVisitDate?: string; // ISO DateTime
    currentStatus: string;
    bloodGroup?: string;
}

export interface PatientEMRResponse {
    patientDetails: PatientResponse;
    clinicalNotes: ClinicalNoteDTO[];
    prescriptions: PrescriptionResponse[];
    vitalsHistory: VitalsResponse[];
    labReports: LabTestRequestResponse[];
    admissionHistory: AdmissionSummaryDTO[];
}

export interface PrescriptionResponse {
    id: string; // UUID
    patientId?: string;
    patientName?: string;
    doctorId?: string;
    doctorName?: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    createdAt: string; // ISO DateTime
}

export interface VitalsResponse {
    id: string; // UUID
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    oxygenSaturation: string;
    height: string;
    weight: string;
    recordedAt: string; // ISO DateTime
}

export interface LabTestRequestResponse {
    id: string; // UUID
    testType: string;
    priority: string;
    notes?: string;
    status: string;
    requestedAt: string; // ISO DateTime
}

export interface AdmissionSummaryDTO {
    id: string; // UUID
    admissionDate: string;
    dischargeDate?: string;
    status: string;
    wardName: string;
    bedNumber: string;
}

export interface VitalsRequest {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    oxygenSaturation: string;
    height: string;
    weight: string;
}

export interface CreateLabTestRequest {
    testType: string;
    priority: string; // ROUTINE, URGENT, EMERGENCY
    notes: string;
}

export interface ClinicalPrescriptionRequest {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
}

// Infrastructure & Asset Management Types
export type RoomType = 'GENERAL' | 'SEMI_PRIVATE' | 'PRIVATE' | 'ICU' | 'THEATRE' | 'EMERGENCY' | 'LAB' | 'RADIOLOGY' | 'CONSULTATION';

export interface RoomDTO {
    id: string;
    floorId: string;
    roomNumber: string;
    roomType: RoomType;
    totalBeds: number;
    active: boolean;
    beds: BedDTO[];
}

export interface FloorDTO {
    id: string;
    buildingId: string;
    floorNumber: number;
    name: string;
    rooms: RoomDTO[];
}

export interface BuildingDTO {
    id: string;
    branchId: string;
    name: string;
    floors: FloorDTO[];
}

export interface WardMapDTO {
    wardId: string;
    wardName: string;
    wardType: string;
    rooms: RoomDTO[];
}

export type AssetType = 'VENTILATOR' | 'MONITOR' | 'INFUSION_PUMP' | 'DEFIBRILLATOR' | 'XRAY_MOBILE' | 'ECG' | 'OTHER';
export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'DECOMMISSIONED';

export interface MedicalAssetDTO {
    id: string;
    name: string;
    assetType: AssetType;
    serialNumber: string;
    manufacturer: string;
    purchaseDate: string;
    status: AssetStatus;
    currentLocationType: 'BED' | 'ROOM' | 'FLOOR' | 'STORAGE';
    currentLocationId: string;
}
