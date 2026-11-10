import React from 'react'
import AssessmentBadge from '../assessments/AssessmentBadge'

export interface JobAssessmentSummary {
	total_score: number
	recommendation: string
}

export interface Job {
	id: number
	company: string
	title: string
	location?: string
	work_arrangement?: string
	url?: string
	stage: string
	status: string
	notes?: string
	assessment?: JobAssessmentSummary | null
}

interface JobListProps {
	jobs: Job[]
	onEdit?: (job: Job) => void
	onDelete?: (job: Job) => void
	onAssess?: (job: Job) => void
}

const JobList = ({ jobs, onEdit, onDelete, onAssess }: JobListProps) => {
	if (jobs.length === 0) {
		return <p>No jobs tracked yet.</p>
	}

	return (
		<ul style={{ listStyle: 'none', padding: 0 }}>
			{jobs.map((job) => (
				<li
					key={job.id}
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
						padding: '0.85rem 0',
						borderBottom: '1px solid #eee'
					}}
				>
					<div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
							<strong>{job.company}</strong> — <span>{job.title}</span>
							{job.assessment && (
								<AssessmentBadge
									totalScore={job.assessment.total_score}
									recommendation={job.assessment.recommendation}
									onClick={onAssess ? () => onAssess(job) : undefined}
								/>
							)}
						</div>

						<div
							style={{
								fontSize: '0.875rem',
								color: '#555',
								marginTop: '0.35rem'
							}}
						>
							<span>Stage: {job.stage}</span> | <span>Status: {job.status}</span>
							{job.work_arrangement && <span> | {job.work_arrangement}</span>}
							{job.location && <span> ({job.location})</span>}
						</div>

						{job.url && (
							<div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
								<a href={job.url} target="_blank" rel="noreferrer">
									View Posting
								</a>
							</div>
						)}

						{job.notes && (
							<p style={{ fontSize: '0.875rem', color: '#444', margin: '0.25rem 0 0 0' }}>
								{job.notes}
							</p>
						)}
					</div>

					<div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
						{onAssess && (
							<button
								type="button"
								onClick={() => onAssess(job)}
							>
								{job.assessment ? 'Re-assess' : 'Assess'}
							</button>
						)}

						{onEdit && (
							<button
								type="button"
								onClick={() => onEdit(job)}
							>
								Edit
							</button>
						)}

						{onDelete && (
							<button
								type="button"
								onClick={() => onDelete(job)}
								style={{ color: '#dc2626' }}
							>
								Delete
							</button>
						)}
					</div>
				</li>
			))}
		</ul>
	)
}

export default JobList