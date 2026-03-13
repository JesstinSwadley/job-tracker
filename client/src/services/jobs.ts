export interface Job {
	id: number;
	position: string;
	company: string;
	user_id: number;
	status: string;
	salary?: string;
	job_url?: string;
	notes?: string;
	source?: string;
	location_type?: string;
	applied_at?: string;
	interviewed_at?: string;
}

export interface CreateJobRequest {
	position: string;
	company: string;
}

const API_BASE = '/api/v1';

const getAuthHeaders = () => {
	const token = localStorage.getItem('token');

	if (!token) {
		console.warn("No token found in localStorage");
	}

	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	};
}

export const fetchJobs = async (): Promise<Job[]> => {
	const response = await fetch(`${API_BASE}/jobs`, {
		method: 'GET',
		headers: getAuthHeaders(),
	});

	if (!response.ok) {
		throw new Error('Failed to fetch jobs');
	}

	return response.json();
}

export const createJob = async (jobData: Partial<Job>): Promise<Job> => {
	const response = await fetch(`${API_BASE}/jobs`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(jobData),
	});

	if (!response.ok) {
		const errorData = await response.json();

		throw new Error(errorData.error || 'Failed to create job');
	}

	return response.json();
}

export const deleteJob = async (jobId: number): Promise<void> => {
	const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
		method: 'DELETE',
		headers: getAuthHeaders(),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || 'Failed to delete job');
	}
}

export const updateJob = async (id: number, jobData: Partial<Job>): Promise<Job> => {
	const response = await fetch(`${API_BASE}/jobs/${id}`, {
		method: 'PUT',
		headers: getAuthHeaders(),
		body: JSON.stringify(jobData),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || 'Failed to update job');
	}

	return response.json();
};