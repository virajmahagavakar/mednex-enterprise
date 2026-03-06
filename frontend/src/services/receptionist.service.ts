import { apiClient } from './api.client';
import type { WardDTO, BedDTO } from './api.types';

const IPD_API_PREFIX = '/v1/clinical/ipd';

export const ReceptionistService = {
    // IPD Endpoints for Receptionists
    getWards: async (branchId: string): Promise<WardDTO[]> => {
        const { data } = await apiClient.get<WardDTO[]>(`${IPD_API_PREFIX}/wards?branchId=${branchId}`);
        return data;
    },

    getBedsByWard: async (wardId: string): Promise<BedDTO[]> => {
        const { data } = await apiClient.get<BedDTO[]>(`${IPD_API_PREFIX}/wards/${wardId}/beds`);
        return data;
    }
};
