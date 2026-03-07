import { apiClient } from './api.client';
import type {
    PatientDashboardStatsDTO,
    DoctorInfoDTO,
    AvailableSlotDTO,
    AppointmentBookingRequest,
    PatientAppointmentResponseDTO,
    PatientProfileDTO,
    PatientProfileUpdateDTO
} from './api.types';

export const PatientService = {
    getDashboardStats: async (): Promise<PatientDashboardStatsDTO> => {
        const response = await apiClient.get<PatientDashboardStatsDTO>('/clinical/patient-portal/dashboard/stats');
        return response.data;
    },

    getAvailableSpecializations: async (): Promise<string[]> => {
        const response = await apiClient.get<string[]>('/clinical/appointments/wizard/specializations');
        return response.data;
    },

    getDoctorsBySpecialization: async (specialization: string): Promise<DoctorInfoDTO[]> => {
        const response = await apiClient.get<DoctorInfoDTO[]>(`/clinical/appointments/wizard/doctors?specialization=${encodeURIComponent(specialization)}`);
        return response.data;
    },

    getDoctorAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlotDTO[]> => {
        const response = await apiClient.get<AvailableSlotDTO[]>(`/clinical/appointments/wizard/doctors/${doctorId}/slots?date=${date}`);
        return response.data;
    },

    bookAppointment: async (request: AppointmentBookingRequest): Promise<string> => {
        const response = await apiClient.post<string>('/clinical/appointments/wizard/book', request);
        return response.data;
    },

    getPatientAppointments: async (): Promise<PatientAppointmentResponseDTO[]> => {
        const response = await apiClient.get<PatientAppointmentResponseDTO[]>('/clinical/patient-portal/appointments');
        return response.data;
    },

    getProfile: async (): Promise<PatientProfileDTO> => {
        const response = await apiClient.get<PatientProfileDTO>('/clinical/patient-portal/profile');
        return response.data;
    },

    updateProfile: async (data: PatientProfileUpdateDTO): Promise<void> => {
        await apiClient.put('/clinical/patient-portal/profile', data);
    }
};
