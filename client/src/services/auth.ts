export interface AuthResponse {
    token: string;
    username: string;
}

const API_BASE = '/api/v1';

export const loginRequest = async (username: string, password: string): Promise<AuthResponse> => {
	const response = await fetch(`${API_BASE}/login`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({
				username,
				password
			})
		});

	const data = await response.json();
	
	if (!response.ok) {
		throw new Error(data.error || 'Login failed');
	}

	return data as AuthResponse;
}

export const registerRequest = async (username: string, password: string) => {
	const response = await fetch(`${API_BASE}/register`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({
				username,
				password
			})
		});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'Register failed');
	}

	return response.json();
}