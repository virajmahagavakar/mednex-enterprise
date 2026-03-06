import { apiClient } from './api.client';
import type {
    NurseDashboardStatsDTO,
    AppointmentResponse,
    TriageRequest
} from './api.types';

const NURSE_API_PREFIX = '/v1/clinical/nurses';

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
    }
};
