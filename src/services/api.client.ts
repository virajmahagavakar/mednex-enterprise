import type { InternalAxiosRequestConfig } from 'axios';
import axios, { AxiosError } from 'axios';
import type { AuthResponse } from './api.types';

const API_BASE_URL = 'http://localhost:8080/api'; // Adjust proxy in vite.config.ts if needed

// Axios instance for authenticated requests
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios instance for public requests (login, registration)
export const publicApiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token Management Utility
export const TokenService = {
    getToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setTokens: (auth: AuthResponse) => {
        localStorage.setItem('accessToken', auth.accessToken);
        localStorage.setItem('refreshToken', auth.refreshToken);
    },
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

// Request Interceptor to inject Token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = TokenService.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor to handle Refresh Token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = TokenService.getRefreshToken();

            if (refreshToken) {
                try {
                    // Attempt to refresh token
                    const { data } = await publicApiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
                    TokenService.setTokens(data);

                    // Re-inject the new token to the failing request
                    originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, force logout
                    TokenService.clearTokens();
                    window.location.href = '/login'; // Or emit event to router
                    return Promise.reject(refreshError);
                }
            } else {
                TokenService.clearTokens();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
