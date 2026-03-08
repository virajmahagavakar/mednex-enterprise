import { apiClient as api } from './api.client';
import type {
    DiagnosticTestCatalogDTO,
    DiagnosticOrderDTO,
    DiagnosticOrderLineItemDTO,
    DiagnosticOrderRequest,
    DiagnosticResultUploadRequest,
    TestType
} from './api.types';

export const DiagnosticService = {
    getCatalog: async (type?: TestType): Promise<DiagnosticTestCatalogDTO[]> => {
        const response = await api.get('/diagnostics/catalog', { params: { type } });
        return response.data;
    },

    createOrder: async (request: DiagnosticOrderRequest): Promise<DiagnosticOrderDTO> => {
        const response = await api.post('/diagnostics/orders', request);
        return response.data;
    },

    getPatientOrders: async (patientId: string): Promise<DiagnosticOrderDTO[]> => {
        const response = await api.get(`/diagnostics/patients/${patientId}/orders`);
        return response.data;
    },

    getWorklist: async (type: TestType): Promise<DiagnosticOrderLineItemDTO[]> => {
        const response = await api.get('/diagnostics/worklist', { params: { type } });
        return response.data;
    },

    uploadResult: async (lineItemId: string, request: DiagnosticResultUploadRequest): Promise<any> => {
        const response = await api.post(`/diagnostics/worklist/${lineItemId}/results`, request);
        return response.data;
    }
};
