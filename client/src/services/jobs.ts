import { apiClient } from "./apiClient";

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

export const fetchJobs = (): Promise<Job[]> => {
	return apiClient<Job[]>('/jobs', {
		method: 'GET' 
	});
}

export const createJob = (jobData: Partial<Job>): Promise<Job> => {
	return 	apiClient<Job>('/jobs', {
		method: 'POST',
		body: JSON.stringify(jobData)
	});
}

export const updateJob = (id: number, jobData: Partial<Job>): Promise<Job> => {
	return 	apiClient<Job>(`/jobs/${id}`, {
		method: 'PUT',
		body: JSON.stringify(jobData)
	});
}

export const deleteJob = (jobId: number): Promise<void> => {
	return apiClient<void>(`/jobs/${jobId}`, {
		method: 'DELETE'
	});
}
