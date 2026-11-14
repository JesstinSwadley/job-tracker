import type { CreateJobInput, Job, UpdateJobInput } from '../types'
import { request } from './http'

export function fetchJobs(): Promise<Job[]> {
	return request<Job[]>('/jobs')
}

export function createJob(input: CreateJobInput): Promise<Job> {
	return request<Job>('/jobs', {
		method: 'POST',
		body: JSON.stringify(input),
	})
}

export function updateJob(id: number, input: UpdateJobInput): Promise<Job> {
	return request<Job>(`/jobs/${id}`, {
		method: 'PUT',
		body: JSON.stringify(input),
	})
}

export function deleteJob(id: number): Promise<void> {
	return request<void>(`/jobs/${id}`, {
		method: 'DELETE',
	})
}