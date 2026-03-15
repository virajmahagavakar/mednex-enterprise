import { apiClient } from './api.client';
import type {
    NurseDashboardStatsDTO,
    AppointmentResponse,
    TriageRequest,
    WardDTO,
    BedDTO,
    AdmissionDTO,
    VitalsRequest,
    VitalsResponse,
    MedicationAdministrationDTO,
    MedicationAdministrationRequest,
    PrescriptionResponse
} from './api.types';

const NURSE_API_PREFIX = '/v1/clinical/nurses';
const IPD_API_PREFIX = '/v1/clinical/ipd';

export const NurseService = {
    getDashboardStats: async (): Promise<NurseDashboardStatsDTO> => {
        const { data } = await apiClient.get<NurseDashboardStatsDTO>(`${NURSE_API_PREFIX}/dashboard`);
        return data;
    },

    getTodayAppointments: async (): Promise<AppointmentResponse[]> => {
        const { data } = await apiClient.get<AppointmentResponse[]>(`${NURSE_API_PREFIX}/appointments/today`);
        return data;
    },

    performTriage: async (id: string, request: TriageRequest): Promise<AppointmentResponse> => {
        const { data } = await apiClient.post<AppointmentResponse>(`${NURSE_API_PREFIX}/appointments/${id}/triage`, request);
        return data;
    },

    // IPD Endpoints for Nurses
    getWards: async (branchId: string): Promise<WardDTO[]> => {
        const { data } = await apiClient.get<WardDTO[]>(`${IPD_API_PREFIX}/wards?branchId=${branchId}`);
        return data;
    },

    getBedsByWard: async (wardId: string): Promise<BedDTO[]> => {
        const { data } = await apiClient.get<BedDTO[]>(`${IPD_API_PREFIX}/wards/${wardId}/beds`);
        return data;
    },

    getActiveAdmissionsByBranch: async (branchId: string): Promise<AdmissionDTO[]> => {
        const { data } = await apiClient.get<AdmissionDTO[]>(`${IPD_API_PREFIX}/admissions/active/branch?branchId=${branchId}`);
        return data;
    },

    getActiveAdmissionsByWard: async (wardId: string): Promise<AdmissionDTO[]> => {
        const { data } = await apiClient.get<AdmissionDTO[]>(`${IPD_API_PREFIX}/admissions/active/ward?wardId=${wardId}`);
        return data;
    },

    recordVitals: async (admissionId: string, request: VitalsRequest): Promise<VitalsResponse> => {
        const { data } = await apiClient.post<VitalsResponse>(`${IPD_API_PREFIX}/admissions/${admissionId}/vitals`, request);
        return data;
    },

    getActivePrescriptions: async (admissionId: string): Promise<PrescriptionResponse[]> => {
        const { data } = await apiClient.get<PrescriptionResponse[]>(`${IPD_API_PREFIX}/admissions/${admissionId}/prescriptions`);
        return data;
    },

    recordMedicationAdministration: async (admissionId: string, request: MedicationAdministrationRequest): Promise<MedicationAdministrationDTO> => {
        const { data } = await apiClient.post<MedicationAdministrationDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/medication`, request);
        return data;
    },

    getMedicationHistory: async (admissionId: string): Promise<MedicationAdministrationDTO[]> => {
        const { data } = await apiClient.get<MedicationAdministrationDTO[]>(`${IPD_API_PREFIX}/admissions/${admissionId}/medication-history`);
        return data;
    }
};
