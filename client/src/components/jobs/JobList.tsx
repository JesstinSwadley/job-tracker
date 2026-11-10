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

function getStatusBadgeStyle(status: string): string {
	switch (status) {
		case 'Active':
			return 'bg-blue-50 text-blue-700 border-blue-200'
		case 'Interviewing':
			return 'bg-purple-50 text-purple-700 border-purple-200'
		case 'Offer':
			return 'bg-emerald-50 text-emerald-700 border-emerald-200'
		case 'Rejected':
			return 'bg-rose-50 text-rose-700 border-rose-200'
		case 'Withdrawn':
			return 'bg-slate-100 text-slate-600 border-slate-200'
		default:
			return 'bg-slate-100 text-slate-700 border-slate-200'
	}
}

const JobList = ({ jobs, onEdit, onDelete, onAssess }: JobListProps) => {
	if (jobs.length === 0) {
		return (
			<div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
				<p className="text-sm font-medium text-slate-500">No jobs tracked yet.</p>
				<p className="text-xs text-slate-400 mt-1">
					Add an application above to start tracking and evaluating opportunities.
				</p>
			</div>
		)
	}

	return (
		<ul className="space-y-3">
			{jobs.map((job) => (
				<li
					key={job.id}
					className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all gap-4"
				>
					<div className="space-y-2 min-w-0 flex-1">
						{/* Title, Company, and Assessment Badge */}
						<div className="flex items-center gap-2.5 flex-wrap">
							<div className="text-sm">
								<strong className="font-semibold text-slate-900">{job.company}</strong>
								<span className="text-slate-400 mx-1.5">—</span>
								<span className="text-slate-700">{job.title}</span>
							</div>

							{job.assessment && (
								<AssessmentBadge
									totalScore={job.assessment.total_score}
									recommendation={job.assessment.recommendation}
									onClick={onAssess ? () => onAssess(job) : undefined}
								/>
							)}
						</div>

						{/* Pipeline Stage, Status, Arrangement, and Location */}
						<div className="flex items-center gap-2 flex-wrap text-xs">
							<span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
								Stage: {job.stage}
							</span>
							<span className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${getStatusBadgeStyle(job.status)}`}>
								Status: {job.status}
							</span>
							{job.work_arrangement && (
								<span className="text-slate-500 font-medium">
									• {job.work_arrangement}
								</span>
							)}
							{job.location && (
								<span className="text-slate-400">
									({job.location})
								</span>
							)}
						</div>

						{/* Optional Job URL Link */}
						{job.url && (
							<div className="pt-0.5">
								<a
									href={job.url}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
								>
									<span>View Posting</span>
									<span aria-hidden="true">↗</span>
								</a>
							</div>
						)}

						{/* Optional Notes */}
						{job.notes && (
							<p className="text-xs text-slate-600 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 leading-relaxed whitespace-pre-wrap">
								{job.notes}
							</p>
						)}
					</div>

					{/* Action Buttons Toolbar */}
					<div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
						{onAssess && (
							<button
								type="button"
								onClick={() => onAssess(job)}
								className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
							>
								{job.assessment ? 'Re-assess' : 'Assess'}
							</button>
						)}

						{onEdit && (
							<button
								type="button"
								onClick={() => onEdit(job)}
								className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
							>
								Edit
							</button>
						)}

						{onDelete && (
							<button
								type="button"
								onClick={() => onDelete(job)}
								className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors cursor-pointer"
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