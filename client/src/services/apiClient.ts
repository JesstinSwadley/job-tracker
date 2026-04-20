const API_BASE = '/api/v1';

export class ApiError extends Error {
	public status: number

	constructor(message: string, status: number) {
		super(message);

		this.status = status;
		this.name = 'ApiError';

		Object.setPrototypeOf(this, ApiError.prototype);
	}
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions extends Omit<RequestInit, 'method'> {
	method?: HttpMethod;
	requiresAuth?: boolean;
}

export const apiClient = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
	const { requiresAuth = true, ...fetchOptions } = options;
	const token = localStorage.getItem('token');

	const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(requiresAuth && token && { 'Authorization': `Bearer ${token}`}),
		...fetchOptions.headers,
	};

	const response = await fetch(`${API_BASE}${cleanEndpoint}`, {
		...fetchOptions,
		headers,
	});

	if (response.status === 401 && requiresAuth) {
		localStorage.removeItem('token');
		localStorage.removeItem('username');

		window.location.href = '/login?error=session_expired';

		return Promise.reject(new Error("Session expired. Please log in again"));
	}

	if (response.status === 204) return null as T;

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));

		throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
	}

	const contentType = response.headers.get("content-type");

	if (contentType && contentType.includes("application/json")) {
		return response.json();
	}

	return null as T;
}