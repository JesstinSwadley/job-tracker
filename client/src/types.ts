export const JOB_STAGES = [
	'Search',
	'Assessment',
	'Interviewing',
	'Offer',
	'Archived',
] as const

export type JobStage = (typeof JOB_STAGES)[number]

export const JOB_STATUSES = [
	'Active',
	'Rejected',
	'Withdrawn',
	'Ghosted',
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export const WORK_ARRANGEMENTS = [
	'Remote', 
	'Hybrid', 
	'Onsite'
] as const

export const JOB_SOURCES = [
	'LinkedIn',
	'Company Board',
	'Referral',
	'Inbound / Recruiter',
	'Wellfound',
	'Other',
] as const

export const NOTE_SECTIONS = [
	'General',
	'Role',
	'Interview',
	'Compensation',
] as const

export type NoteSection = (typeof NOTE_SECTIONS)[number]

export interface Job {
	id: number
	company: string
	title: string
	location: string
	work_arrangement: string
	source: string
	application_platform: string
	url: string
	stage: string
	interview_round: number
	status: string
	date_posted: string
	date_found: string
	date_assessed: string
	date_applied: string
	resume_url: string
	cover_letter_url: string
	notes: string
	assessment_total_score?: number | null
	assessment_recommendation?: string
	notes_count: number
	created_at?: string
	updated_at?: string
}

export interface CreateJobInput {
	company: string
	title: string
	location?: string
	work_arrangement?: string
	source?: string
	application_platform?: string
	url?: string
	stage?: string
	interview_round?: number
	status?: string
	date_posted?: string
	date_found?: string
	date_assessed?: string
	date_applied?: string
	resume_url?: string
	cover_letter_url?: string
	notes?: string
}

export type UpdateJobInput = CreateJobInput

export interface AssessmentScores {
	career_alignment: number
	experience_match: number
	technical_alignment: number
	compensation_score: number
	work_arrangement_score: number
	geographic_alignment: number
	growth_value: number
}

export interface AssessmentResponse extends AssessmentScores {
	job_id: number
	total_score: number
	recommendation: string
}

export interface JobNote {
	id: number
	job_id: number
	section: string
	interview_round: number
	content: string
	created_at?: string
	updated_at?: string
}

export interface CreateJobNoteInput {
	section?: string
	interview_round?: number
	content: string
}

export type UpdateJobNoteInput = CreateJobNoteInput