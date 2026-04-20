import { apiClient } from "./apiClient"

export interface AuthResponse {
	token: string;
	username: string;
}

export const loginRequest = async (username: string, password: string) => {
	return apiClient<AuthResponse>('/login', {
		method: 'POST',
		requiresAuth: false,
		body: JSON.stringify({
			username,
			password
		}),
	});
};

export const registerRequest = async (username: string, password: string) => {
	return apiClient<AuthResponse>('/register', {
		method: 'POST',
		requiresAuth: false,
		body: JSON.stringify({
			username,
			password,
		}),
	});
};