import api from "./client";

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    // phone?: string;
}

interface AuthResponse {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
    };
}

export const authApi = {
    login: (data: LoginRequest) => 
        api.post<AuthResponse>('/auth/login', data),

    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/auth/register', data),

    getCurrentUser: () =>
        api.get('/auth/me'),
};