import { apiClient } from './api.client';
import type {
    BranchRequest, BranchResponse,
    RoleResponse,
    StaffRegistrationRequest, StaffResponse,
    SubscriptionRequest, SubscriptionResponse,
    ProfileResponse, ProfileRequest
} from './api.types';

export const AdminService = {
    // --- Branch Management ---
    getBranches: async (): Promise<BranchResponse[]> => {
        const response = await apiClient.get<BranchResponse[]>('/v1/admin/branches');
        return response.data;
    },

    createBranch: async (branch: BranchRequest): Promise<BranchResponse> => {
        const response = await apiClient.post<BranchResponse>('/v1/admin/branches', branch);
        return response.data;
    },

    removeBranchAdmin: async (branchId: string): Promise<void> => {
        await apiClient.delete<void>(`/v1/admin/branches/${branchId}/admin`);
    },

    // --- Role & Staff Management ---
    getRoles: async (): Promise<RoleResponse[]> => {
        const response = await apiClient.get<RoleResponse[]>('/v1/admin/roles');
        return response.data;
    },

    getStaff: async (): Promise<StaffResponse[]> => {
        const response = await apiClient.get<StaffResponse[]>('/v1/admin/staff');
        return response.data;
    },

    onboardStaff: async (staffData: StaffRegistrationRequest): Promise<StaffResponse> => {
        const response = await apiClient.post<StaffResponse>('/v1/admin/staff/onboard', staffData);
        return response.data;
    },

    // --- Subscription Management ---
    getSubscriptionStatus: async (): Promise<SubscriptionResponse> => {
        const response = await apiClient.get<SubscriptionResponse>('/v1/admin/subscription/status');
        return response.data;
    },

    renewSubscription: async (req: SubscriptionRequest): Promise<SubscriptionResponse> => {
        const response = await apiClient.post<SubscriptionResponse>('/v1/admin/subscription/renew', req);
        return response.data;
    },

    // --- Profile Management ---
    getProfile: async (): Promise<ProfileResponse> => {
        const response = await apiClient.get<ProfileResponse>('/v1/admin/profile');
        return response.data;
    },

    updateProfile: async (req: ProfileRequest): Promise<ProfileResponse> => {
        const response = await apiClient.put<ProfileResponse>('/v1/admin/profile', req);
        return response.data;
    },

    getCurrentProfile: async (): Promise<ProfileResponse> => {
        return AdminService.getProfile();
    }
};
