import { apiClient } from './api.client';
import type {
    DoctorDashboardStatsDTO,
    AppointmentResponse,
    AppointmentUpdateRequest,
    PatientResponse,
    MedicineDTO,
    CreatePrescriptionRequest,
    PharmacyPrescriptionDTO,
    ClinicalNoteDTO,
    CreateClinicalNoteRequest,
    WardDTO,
    BedDTO,
    AdmissionDTO,
    AdmissionRequest,
    DailyRoundDTO,
    DailyRoundRequest,
    DoctorScheduleDTO,
    DashboardChartDataDTO,
    PatientSummaryDTO,
    PatientEMRResponse,
    PatientAppointmentResponseDTO,
    PrescriptionResponse,
    VitalsResponse,
    LabTestRequestResponse,
    AdmissionSummaryDTO,
    VitalsRequest,
    CreateLabTestRequest,
    ClinicalPrescriptionRequest,
    AdmissionRequestDTO,
    AssignBedRequest,
    EquipmentRequestDTO,
    EquipmentRequestAction
} from './api.types';

const DOCTOR_API_PREFIX = '/v1/clinical/doctors';
const CONSULTATION_API_PREFIX = '/v1/clinical/consultation';
const PHARMACY_CLINICAL_API_PREFIX = '/v1/pharmacy/clinical';
const IPD_API_PREFIX = '/v1/clinical/ipd';

export const DoctorService = {
    getDashboardStats: async (): Promise<DoctorDashboardStatsDTO> => {
        const { data } = await apiClient.get<DoctorDashboardStatsDTO>(`${DOCTOR_API_PREFIX}/dashboard`);
        return data;
    },

    getDetailedStats: async (): Promise<DashboardChartDataDTO[]> => {
        const { data } = await apiClient.get<DashboardChartDataDTO[]>(`${DOCTOR_API_PREFIX}/dashboard/detailed`);
        return data;
    },

    getTodayAppointments: async (): Promise<AppointmentResponse[]> => {
        const { data } = await apiClient.get<AppointmentResponse[]>(`${DOCTOR_API_PREFIX}/appointments/today`);
        return data;
    },

    getWaitingQueue: async (): Promise<AppointmentResponse[]> => {
        const { data } = await apiClient.get<AppointmentResponse[]>(`${DOCTOR_API_PREFIX}/queue`);
        return data;
    },

    getAppointments: async (date?: string): Promise<AppointmentResponse[]> => {
        const url = date ? `${DOCTOR_API_PREFIX}/appointments?date=${date}` : `${DOCTOR_API_PREFIX}/appointments`;
        const { data } = await apiClient.get<AppointmentResponse[]>(url);
        return data;
    },

    getAppointmentDetails: async (id: string): Promise<AppointmentResponse> => {
        const { data } = await apiClient.get<AppointmentResponse>(`${DOCTOR_API_PREFIX}/appointments/${id}`);
        return data;
    },

    updateAppointment: async (id: string, request: AppointmentUpdateRequest): Promise<AppointmentResponse> => {
        const { data } = await apiClient.put<AppointmentResponse>(`${DOCTOR_API_PREFIX}/appointments/${id}`, request);
        return data;
    },

    getPatients: async (): Promise<PatientResponse[]> => {
        const { data } = await apiClient.get<PatientResponse[]>(`${DOCTOR_API_PREFIX}/patients`);
        return data;
    },

    getPatientDetails: async (patientId: string): Promise<PatientResponse> => {
        const { data } = await apiClient.get<PatientResponse>(`${DOCTOR_API_PREFIX}/patients/${patientId}`);
        return data;
    },

    getPatientClinicalNotes: async (patientId: string): Promise<ClinicalNoteDTO[]> => {
        const { data } = await apiClient.get<ClinicalNoteDTO[]>(`${DOCTOR_API_PREFIX}/patients/${patientId}/emr`);
        return data;
    },

    createClinicalNote: async (appointmentId: string, request: CreateClinicalNoteRequest): Promise<ClinicalNoteDTO> => {
        const { data } = await apiClient.post<ClinicalNoteDTO>(`${DOCTOR_API_PREFIX}/appointments/${appointmentId}/notes`, request);
        return data;
    },

    // New Production EMR Endpoints
    getPatientsForDoctor: async (): Promise<PatientSummaryDTO[]> => {
        const { data } = await apiClient.get<PatientSummaryDTO[]>(`${DOCTOR_API_PREFIX}/patients`);
        return data;
    },

    getPatientFullEMR: async (patientId: string): Promise<PatientEMRResponse> => {
        const { data } = await apiClient.get<PatientEMRResponse>(`${DOCTOR_API_PREFIX}/patients/${patientId}`);
        return data;
    },

    createPatientNote: async (patientId: string, request: CreateClinicalNoteRequest): Promise<ClinicalNoteDTO> => {
        const { data } = await apiClient.post<ClinicalNoteDTO>(`${DOCTOR_API_PREFIX}/patients/${patientId}/notes`, request);
        return data;
    },

    createClinicalPrescription: async (patientId: string, request: ClinicalPrescriptionRequest): Promise<PrescriptionResponse> => {
        const { data } = await apiClient.post<PrescriptionResponse>(`${DOCTOR_API_PREFIX}/patients/${patientId}/prescriptions`, request);
        return data;
    },

    requestLabTest: async (patientId: string, request: CreateLabTestRequest): Promise<LabTestRequestResponse> => {
        const { data } = await apiClient.post<LabTestRequestResponse>(`${DOCTOR_API_PREFIX}/patients/${patientId}/lab-tests`, request);
        return data;
    },

    recordVitals: async (patientId: string, request: VitalsRequest): Promise<VitalsResponse> => {
        const { data } = await apiClient.post<VitalsResponse>(`${DOCTOR_API_PREFIX}/patients/${patientId}/vitals`, request);
        return data;
    },

    // Clinical Pharmacy Endpoints
    getMedicines: async (): Promise<MedicineDTO[]> => {
        const { data } = await apiClient.get<MedicineDTO[]>(`${PHARMACY_CLINICAL_API_PREFIX}/medicines`);
        return data;
    },

    createPrescription: async (request: CreatePrescriptionRequest): Promise<PharmacyPrescriptionDTO> => {
        const { data } = await apiClient.post<PharmacyPrescriptionDTO>(`${PHARMACY_CLINICAL_API_PREFIX}/prescriptions`, request);
        return data;
    },

    // IPD Endpoints
    getWards: async (branchId: string): Promise<WardDTO[]> => {
        const { data } = await apiClient.get<WardDTO[]>(`${IPD_API_PREFIX}/wards?branchId=${branchId}`);
        return data;
    },

    getBedsByWard: async (wardId: string): Promise<BedDTO[]> => {
        const { data } = await apiClient.get<BedDTO[]>(`${IPD_API_PREFIX}/wards/${wardId}/beds`);
        return data;
    },

    requestAdmission: async (request: AdmissionRequestDTO): Promise<AdmissionDTO> => {
        const { data } = await apiClient.post<AdmissionDTO>(`${IPD_API_PREFIX}/admissions/request`, request);
        return data;
    },

    admitPatient: async (admissionId: string, request: AssignBedRequest): Promise<AdmissionDTO> => {
        const { data } = await apiClient.patch<AdmissionDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/assign-bed`, request);
        return data;
    },

    getAdmissionsByDoctor: async (): Promise<AdmissionDTO[]> => {
        const { data } = await apiClient.get<AdmissionDTO[]>(`${IPD_API_PREFIX}/admissions/me`);
        return data;
    },

    getAdmissionsByPatient: async (patientId: string): Promise<AdmissionDTO[]> => {
        const { data } = await apiClient.get<AdmissionDTO[]>(`${IPD_API_PREFIX}/patients/${patientId}/admissions`);
        return data;
    },

    dischargePatient: async (admissionId: string): Promise<AdmissionDTO> => {
        const { data } = await apiClient.post<AdmissionDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/discharge`);
        return data;
    },

    requestDischarge: async (admissionId: string): Promise<AdmissionDTO> => {
        const { data } = await apiClient.patch<AdmissionDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/request-discharge`);
        return data;
    },

    addDailyRound: async (admissionId: string, request: DailyRoundRequest): Promise<DailyRoundDTO> => {
        const { data } = await apiClient.post<DailyRoundDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/rounds`, request);
        return data;
    },

    getDailyRounds: async (admissionId: string): Promise<DailyRoundDTO[]> => {
        const { data } = await apiClient.get<DailyRoundDTO[]>(`${IPD_API_PREFIX}/admissions/${admissionId}/rounds`);
        return data;
    },

    requestEquipment: async (admissionId: string, request: EquipmentRequestAction): Promise<EquipmentRequestDTO> => {
        const { data } = await apiClient.post<EquipmentRequestDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/equipment`, request);
        return data;
    },

    updateEquipmentStatus: async (requestId: string, status: string): Promise<EquipmentRequestDTO> => {
        const { data } = await apiClient.patch<EquipmentRequestDTO>(`${IPD_API_PREFIX}/equipment/${requestId}/status?status=${status}`);
        return data;
    },

    getEquipmentRequests: async (admissionId: string): Promise<EquipmentRequestDTO[]> => {
        const { data } = await apiClient.get<EquipmentRequestDTO[]>(`${IPD_API_PREFIX}/admissions/${admissionId}/equipment`);
        return data;
    },

    // Schedule Endpoints
    getSchedules: async (): Promise<DoctorScheduleDTO[]> => {
        const { data } = await apiClient.get<DoctorScheduleDTO[]>(`${DOCTOR_API_PREFIX}/schedules`);
        return data;
    },

    saveSchedule: async (request: DoctorScheduleDTO): Promise<DoctorScheduleDTO> => {
        const { data } = await apiClient.post<DoctorScheduleDTO>(`${DOCTOR_API_PREFIX}/schedules`, request);
        return data;
    },

    deleteSchedule: async (id: number): Promise<void> => {
        await apiClient.delete(`${DOCTOR_API_PREFIX}/schedules/${id}`);
    },

    denyAppointment: async (id: string, reason: string): Promise<PatientAppointmentResponseDTO> => {
        const { data } = await apiClient.put<PatientAppointmentResponseDTO>(
            `${CONSULTATION_API_PREFIX}/${id}/deny?reason=${encodeURIComponent(reason)}`
        );
        return data;
    },

    transferAppointment: async (id: string, newDepartment: string, newDoctorId?: string, reason?: string): Promise<PatientAppointmentResponseDTO> => {
        let url = `${CONSULTATION_API_PREFIX}/${id}/transfer?newDepartment=${encodeURIComponent(newDepartment)}`;
        if (newDoctorId) url += `&newDoctorId=${newDoctorId}`;
        if (reason) url += `&reason=${encodeURIComponent(reason)}`;
        
        const { data } = await apiClient.put<PatientAppointmentResponseDTO>(url);
        return data;
    }
};
