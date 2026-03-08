import { apiClient } from './api.client';
import type {
    DoctorDashboardStatsDTO,
    AppointmentResponse,
    AppointmentUpdateRequest,
    PatientResponse,
    MedicineDTO,
    CreatePrescriptionRequest,
    PharmacyPrescriptionDTO,
    ClinicalNoteDTO,
    CreateClinicalNoteRequest,
    WardDTO,
    BedDTO,
    AdmissionDTO,
    AdmissionRequest,
    DailyRoundDTO,
    DailyRoundRequest,
    DoctorScheduleDTO
} from './api.types';

const DOCTOR_API_PREFIX = '/v1/clinical/doctors';
const PHARMACY_CLINICAL_API_PREFIX = '/v1/pharmacy/clinical';
const IPD_API_PREFIX = '/v1/clinical/ipd';

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

    getPatientDetails: async (patientId: string): Promise<PatientResponse> => {
        const { data } = await apiClient.get<PatientResponse>(`${DOCTOR_API_PREFIX}/patients/${patientId}`);
        return data;
    },

    getPatientClinicalNotes: async (patientId: string): Promise<ClinicalNoteDTO[]> => {
        const { data } = await apiClient.get<ClinicalNoteDTO[]>(`${DOCTOR_API_PREFIX}/patients/${patientId}/emr`);
        return data;
    },

    createClinicalNote: async (appointmentId: string, request: CreateClinicalNoteRequest): Promise<ClinicalNoteDTO> => {
        const { data } = await apiClient.post<ClinicalNoteDTO>(`${DOCTOR_API_PREFIX}/appointments/${appointmentId}/notes`, request);
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
    },

    // IPD Endpoints
    getWards: async (branchId: string): Promise<WardDTO[]> => {
        const { data } = await apiClient.get<WardDTO[]>(`${IPD_API_PREFIX}/wards?branchId=${branchId}`);
        return data;
    },

    getBedsByWard: async (wardId: string): Promise<BedDTO[]> => {
        const { data } = await apiClient.get<BedDTO[]>(`${IPD_API_PREFIX}/wards/${wardId}/beds`);
        return data;
    },

    admitPatient: async (request: AdmissionRequest): Promise<AdmissionDTO> => {
        const { data } = await apiClient.post<AdmissionDTO>(`${IPD_API_PREFIX}/admissions`, request);
        return data;
    },

    getAdmissionsByDoctor: async (): Promise<AdmissionDTO[]> => {
        const { data } = await apiClient.get<AdmissionDTO[]>(`${IPD_API_PREFIX}/admissions/me`);
        return data;
    },

    getAdmissionsByPatient: async (patientId: string): Promise<AdmissionDTO[]> => {
        const { data } = await apiClient.get<AdmissionDTO[]>(`${IPD_API_PREFIX}/patients/${patientId}/admissions`);
        return data;
    },

    dischargePatient: async (admissionId: string): Promise<AdmissionDTO> => {
        const { data } = await apiClient.post<AdmissionDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/discharge`);
        return data;
    },

    addDailyRound: async (admissionId: string, request: DailyRoundRequest): Promise<DailyRoundDTO> => {
        const { data } = await apiClient.post<DailyRoundDTO>(`${IPD_API_PREFIX}/admissions/${admissionId}/rounds`, request);
        return data;
    },

    getDailyRounds: async (admissionId: string): Promise<DailyRoundDTO[]> => {
        const { data } = await apiClient.get<DailyRoundDTO[]>(`${IPD_API_PREFIX}/admissions/${admissionId}/rounds`);
        return data;
    },

    // Schedule Endpoints
    getSchedules: async (): Promise<DoctorScheduleDTO[]> => {
        const { data } = await apiClient.get<DoctorScheduleDTO[]>(`${DOCTOR_API_PREFIX}/schedules`);
        return data;
    },

    saveSchedule: async (request: DoctorScheduleDTO): Promise<DoctorScheduleDTO> => {
        const { data } = await apiClient.post<DoctorScheduleDTO>(`${DOCTOR_API_PREFIX}/schedules`, request);
        return data;
    },

    deleteSchedule: async (id: number): Promise<void> => {
        await apiClient.delete(`${DOCTOR_API_PREFIX}/schedules/${id}`);
    }
};
