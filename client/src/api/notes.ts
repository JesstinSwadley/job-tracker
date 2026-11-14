import type { CreateJobNoteInput, JobNote, UpdateJobNoteInput } from '../types'
import { request } from './http'

export function fetchJobNotes(jobId: number): Promise<JobNote[]> {
	return request<JobNote[]>(`/jobs/${jobId}/notes`)
}

export function createJobNote(jobId: number, input: CreateJobNoteInput): Promise<JobNote> {
	return request<JobNote>(`/jobs/${jobId}/notes`, {
		method: 'POST',
		body: JSON.stringify(input),
	})
}

export function updateJobNote(
	jobId: number,
	noteId: number,
	input: UpdateJobNoteInput
): Promise<JobNote> {
	return request<JobNote>(`/jobs/${jobId}/notes/${noteId}`, {
		method: 'PUT',
		body: JSON.stringify(input),
	})
}

export function deleteJobNote(jobId: number, noteId: number): Promise<void> {
	return request<void>(`/jobs/${jobId}/notes/${noteId}`, {
		method: 'DELETE',
	})
}