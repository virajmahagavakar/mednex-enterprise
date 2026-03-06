import { apiClient } from './api.client';
import type {
    DoctorDashboardStatsDTO,
    AppointmentResponse,
    AppointmentUpdateRequest,
    PatientResponse,
    MedicineDTO,
    CreatePrescriptionRequest,
    PharmacyPrescriptionDTO
} from './api.types';

const DOCTOR_API_PREFIX = '/v1/clinical/doctors';
const PHARMACY_CLINICAL_API_PREFIX = '/v1/pharmacy/clinical';

export const DoctorService = {
    getDashboardStats: async (): Promise<DoctorDashboardStatsDTO> => {
        const { data } = await apiClient.get<DoctorDashboardStatsDTO>(`${DOCTOR_API_PREFIX}/dashboard`);
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

    // Clinical Pharmacy Endpoints
    getMedicines: async (): Promise<MedicineDTO[]> => {
        const { data } = await apiClient.get<MedicineDTO[]>(`${PHARMACY_CLINICAL_API_PREFIX}/medicines`);
        return data;
    },

    createPrescription: async (request: CreatePrescriptionRequest): Promise<PharmacyPrescriptionDTO> => {
        const { data } = await apiClient.post<PharmacyPrescriptionDTO>(`${PHARMACY_CLINICAL_API_PREFIX}/prescriptions`, request);
        return data;
    }
};
