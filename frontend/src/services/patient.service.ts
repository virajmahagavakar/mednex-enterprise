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
<<<<<<< HEAD
        const response = await apiClient.get<PatientDashboardStatsDTO>('/clinical/patient-portal/dashboard/stats');
=======
        const response = await apiClient.get<PatientDashboardStatsDTO>('/v1/clinical/patient-portal/dashboard/stats');
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        return response.data;
    },

    getAvailableSpecializations: async (): Promise<string[]> => {
<<<<<<< HEAD
        const response = await apiClient.get<string[]>('/clinical/appointments/wizard/specializations');
=======
        const response = await apiClient.get<string[]>('/v1/clinical/appointments/wizard/specializations');
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        return response.data;
    },

    getDoctorsBySpecialization: async (specialization: string): Promise<DoctorInfoDTO[]> => {
<<<<<<< HEAD
        const response = await apiClient.get<DoctorInfoDTO[]>(`/clinical/appointments/wizard/doctors?specialization=${encodeURIComponent(specialization)}`);
=======
        const response = await apiClient.get<DoctorInfoDTO[]>(`/v1/clinical/appointments/wizard/doctors?specialization=${encodeURIComponent(specialization)}`);
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        return response.data;
    },

    getDoctorAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlotDTO[]> => {
<<<<<<< HEAD
        const response = await apiClient.get<AvailableSlotDTO[]>(`/clinical/appointments/wizard/doctors/${doctorId}/slots?date=${date}`);
=======
        const response = await apiClient.get<AvailableSlotDTO[]>(`/v1/clinical/appointments/wizard/doctors/${doctorId}/slots?date=${date}`);
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        return response.data;
    },

    bookAppointment: async (request: AppointmentBookingRequest): Promise<string> => {
<<<<<<< HEAD
        const response = await apiClient.post<string>('/clinical/appointments/wizard/book', request);
=======
        const response = await apiClient.post<string>('/v1/clinical/appointments/wizard/request', request);
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        return response.data;
    },

    getPatientAppointments: async (): Promise<PatientAppointmentResponseDTO[]> => {
<<<<<<< HEAD
        const response = await apiClient.get<PatientAppointmentResponseDTO[]>('/clinical/patient-portal/appointments');
=======
        const response = await apiClient.get<PatientAppointmentResponseDTO[]>('/v1/clinical/patient-portal/appointments');
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        return response.data;
    },

    getProfile: async (): Promise<PatientProfileDTO> => {
<<<<<<< HEAD
        const response = await apiClient.get<PatientProfileDTO>('/clinical/patient-portal/profile');
=======
        const response = await apiClient.get<PatientProfileDTO>('/v1/clinical/patient-portal/profile');
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        return response.data;
    },

    updateProfile: async (data: PatientProfileUpdateDTO): Promise<void> => {
<<<<<<< HEAD
        await apiClient.put('/clinical/patient-portal/profile', data);
=======
        await apiClient.put('/v1/clinical/patient-portal/profile', data);
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
    }
};
