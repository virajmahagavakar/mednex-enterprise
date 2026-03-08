import { apiClient } from './api.client';
import type {
    NurseDashboardStatsDTO,
    AppointmentResponse,
    TriageRequest,
    WardDTO,
    BedDTO
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
    }
};
