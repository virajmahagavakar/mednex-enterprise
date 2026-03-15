import { apiClient } from './api.client';
import type { AmbulanceRequest, AmbulanceResponse } from './api.types';

export const AmbulanceService = {
    requestAmbulance: async (data: AmbulanceRequest): Promise<AmbulanceResponse> => {
        const response = await apiClient.post<AmbulanceResponse>('/v1/patient/ambulance/request', data);
        return response.data;
    },

    getMyRequests: async (): Promise<AmbulanceResponse[]> => {
        const response = await apiClient.get<AmbulanceResponse[]>('/v1/patient/ambulance/my-requests');
        return response.data;
    },

    getActiveRequests: async (): Promise<AmbulanceResponse[]> => {
        const response = await apiClient.get<AmbulanceResponse[]>('/v1/receptionist/ambulance/requests');
        return response.data;
    },

    dispatchAmbulance: async (id: string): Promise<AmbulanceResponse> => {
        const response = await apiClient.patch<AmbulanceResponse>(`/v1/receptionist/ambulance/${id}/dispatch`);
        return response.data;
    },

    completeRequest: async (id: string): Promise<AmbulanceResponse> => {
        const response = await apiClient.patch<AmbulanceResponse>(`/v1/receptionist/ambulance/${id}/complete`);
        return response.data;
    }
};
