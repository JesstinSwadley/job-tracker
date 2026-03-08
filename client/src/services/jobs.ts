// Assign Backend API URL to variable
const API_URL = import.meta.env.VITE_API_URL

export interface Job {
	id: number;
	position: string;
	company: string;
	user_id: number;
}

const getAuthHeaders = () => {
	const token = localStorage.getItem('token');

	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	};
}

export const fetchJobs = async (): Promise<Job[]> => {
	const response = await fetch(`${API_URL}/api/v1/jobs`, {
		method: 'GET',
		headers: getAuthHeaders(),
	});

	if (!response.ok) {
		throw new Error('Failed to fetch jobs');
	}

	return response.json();
}

export const createJob = async (position: string, company: string): Promise<Job> => {
	const response = await fetch(`${API_URL}/api/v1/jobs`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify({ position, company }),
	});

	if (!response.ok) {
		throw new Error('Failed to create job');
	}

	return response.json();
};