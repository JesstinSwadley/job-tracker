export interface AuthResponse {
	token: string;
	username: string;
}

export const loginRequest = async (username: string, password: string): Promise<AuthResponse> => {
	const response = await fetch(`/api/v1/login`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({
				username,
				password
			})
		});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || 'Login failed');
	}

	return response.json();
}

export const registerRequest = async (username: string, password: string) => {
	const response = await fetch(`/api/v1/register`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({
				username,
				password
			})
		});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || 'Register failed');
	}

	return response.json();
}