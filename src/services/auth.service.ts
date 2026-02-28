import { publicApiClient } from './api.client';
import type { AuthRequest, AuthResponse, HospitalRegistrationRequest } from './api.types';
import { TokenService } from './api.client';

export const AuthService = {
    login: async (request: AuthRequest): Promise<AuthResponse> => {
        const response = await publicApiClient.post<AuthResponse>('/auth/login', request);
        TokenService.setTokens(response.data);
        return response.data;
    },

    logout: () => {
        TokenService.clearTokens();
    }
};

export const OnboardingService = {
    registerHospital: async (request: HospitalRegistrationRequest): Promise<{ message: string, tenantId: string, temporaryToken: string }> => {
        const response = await publicApiClient.post('/public/register-hospital', request);
        return response.data;
    }
};
