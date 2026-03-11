import { apiClient } from './api.client';
import type { WardDTO, BedDTO, Appointment, TriageUpdateRequest, DoctorInfoDTO, AdmissionDTO, AssignBedRequest } from './api.types';

const IPD_API_PREFIX = '/v1/clinical/ipd';
const RECEPTIONIST_API_PREFIX = '/v1/receptionist/appointments';

export const ReceptionistService = {
    // Appointment Management
    getRequestedAppointments: async (): Promise<Appointment[]> => {
        const { data } = await apiClient.get<Appointment[]>(`${RECEPTIONIST_API_PREFIX}/requests`);
        return data;
    },

    getTodayAppointments: async (): Promise<Appointment[]> => {
        const { data } = await apiClient.get<Appointment[]>(`${RECEPTIONIST_API_PREFIX}/today`);
        return data;
    },

    getPendingAppointments: async (): Promise<Appointment[]> => {
        const { data } = await apiClient.get<Appointment[]>(`${RECEPTIONIST_API_PREFIX}/pending`);
        return data;
    },

    approveAppointment: async (id: string): Promise<Appointment> => {
        const { data } = await apiClient.put<Appointment>(`${RECEPTIONIST_API_PREFIX}/${id}/approve`);
        return data;
    },

    checkInPatient: async (id: string): Promise<Appointment> => {
        const { data } = await apiClient.put<Appointment>(`${RECEPTIONIST_API_PREFIX}/${id}/check-in`);
        return data;
    },

    cancelAppointment: async (id: string, reason: string): Promise<Appointment> => {
        const { data } = await apiClient.put<Appointment>(`${RECEPTIONIST_API_PREFIX}/${id}/cancel?reason=${encodeURIComponent(reason)}`);
        return data;
    },

    triageAppointment: async (id: string, update: TriageUpdateRequest): Promise<Appointment> => {
        const { data } = await apiClient.put<Appointment>(`${RECEPTIONIST_API_PREFIX}/${id}/triage`, update);
        return data;
    },

    getDoctors: async (): Promise<DoctorInfoDTO[]> => {
        const { data } = await apiClient.get<DoctorInfoDTO[]>(`/v1/doctors`);
        return data;
    },

    // IPD Endpoints for Receptionists
    getWards: async (branchId: string): Promise<WardDTO[]> => {
        const { data } = await apiClient.get<WardDTO[]>(`${IPD_API_PREFIX}/wards?branchId=${branchId}`);
        return data;
    },

    getBedsByWard: async (wardId: string): Promise<BedDTO[]> => {
        const { data } = await apiClient.get<BedDTO[]>(`${IPD_API_PREFIX}/wards/${wardId}/beds`);
        return data;
    },

    getWardsByBranch: async (branchId: string): Promise<WardDTO[]> => {
        return ReceptionistService.getWards(branchId);
    },

    getPendingAdmissions: async (): Promise<AdmissionDTO[]> => {
        const { data } = await apiClient.get<AdmissionDTO[]>(`${IPD_API_PREFIX}/admissions/pending`);
        return data;
    },

    assignBed: async (admissionId: string, request: AssignBedRequest): Promise<AdmissionDTO> => {
        const { data } = await apiClient.patch<AdmissionDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/assign-bed`, request);
        return data;
    },

    // Ambulance Management
    getAmbulanceRequests: async (): Promise<any[]> => {
        const { data } = await apiClient.get<any[]>(`/v1/receptionist/ambulance/requests`);
        return data;
    },

    dispatchAmbulance: async (id: string): Promise<any> => {
        const { data } = await apiClient.patch<any>(`/v1/receptionist/ambulance/${id}/dispatch`);
        return data;
    },

    completeAmbulance: async (id: string): Promise<any> => {
        const { data } = await apiClient.patch<any>(`/v1/receptionist/ambulance/${id}/complete`);
        return data;
    }
};
