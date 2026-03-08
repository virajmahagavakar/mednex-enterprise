import { apiClient as api } from './api.client';
import type {
    OperationTheatreDTO,
    SurgeryScheduleDTO,
    SurgeryScheduleRequest,
    SurgicalNoteRequest,
    AnesthesiaNoteRequest,
    SurgeryStatus
} from './api.types';

export const SurgeryService = {
    getActiveTheatres: async (): Promise<OperationTheatreDTO[]> => {
        const response = await api.get('/v1/surgery/theatres');
        return response.data;
    },

    getSchedule: async (start: string, end: string): Promise<SurgeryScheduleDTO[]> => {
        const response = await api.get('/v1/surgery/schedule', { params: { start, end } });
        return response.data;
    },

    bookSurgery: async (request: SurgeryScheduleRequest): Promise<SurgeryScheduleDTO> => {
        const response = await api.post('/v1/surgery/schedule', request);
        return response.data;
    },

    updateStatus: async (scheduleId: string, status: SurgeryStatus): Promise<SurgeryScheduleDTO> => {
        const response = await api.patch(`/v1/surgery/schedule/${scheduleId}/status`, null, { params: { status } });
        return response.data;
    },

    addSurgicalNote: async (scheduleId: string, request: SurgicalNoteRequest): Promise<any> => {
        const response = await api.post(`/v1/surgery/schedule/${scheduleId}/notes/surgical`, request);
        return response.data;
    },

    addAnesthesiaNote: async (scheduleId: string, request: AnesthesiaNoteRequest): Promise<any> => {
        const response = await api.post(`/v1/surgery/schedule/${scheduleId}/notes/anesthesia`, request);
        return response.data;
    }
};
