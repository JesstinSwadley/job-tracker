import type { AssessmentResponse, AssessmentScores } from '../types'
import { ApiError, request } from './http'

export async function fetchAssessment(jobId: number): Promise<AssessmentResponse | null> {
	try {
		return await request<AssessmentResponse>(`/jobs/${jobId}/assessment`)
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
		return null
		}
		throw err
	}
}

export function saveAssessment(jobId: number, scores: AssessmentScores): Promise<AssessmentResponse> {
	return request<AssessmentResponse>(`/jobs/${jobId}/assessment`, {
		method: 'PUT',
		body: JSON.stringify(scores),
	})
}