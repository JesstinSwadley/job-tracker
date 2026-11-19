import AssessmentBadge from '../assessments/AssessmentBadge'
import { JOB_STAGES, JOB_STATUSES, type Job } from '../../types'

interface JobListProps {
	jobs: Job[]
	onEdit?: (job: Job) => void
	onDelete?: (job: Job) => void
	onAssess?: (job: Job) => void
	onOpenNotes?: (job: Job) => void
	onQuickUpdate?: (job: Job, patch: Partial<Job>) => void
}

function getStatusBadgeStyle(status: string): string {
	switch (status) {
		case 'Active':
			return 'bg-blue-50 text-blue-700 border-blue-200'
		case 'Offer':
			return 'bg-blue-50 text-blue-700 border-blue-200'
		case 'Rejected':
			return 'bg-rose-50 text-rose-700 border-rose-200'
		case 'Withdrawn':
			return 'bg-slate-100 text-slate-600 border-slate-200'
		case 'Ghosted':
			return 'bg-amber-50 text-amber-700 border-amber-200'
		default:
			return 'bg-slate-100 text-slate-700 border-slate-200'
	}
}

function getStageBadgeStyle(stage: string): string {
	switch (stage) {
		case 'Offer':
			return 'bg-emerald-50 text-emerald-700 border-emerald-200'
		case 'Interviewing':
			return 'bg-indigo-50 text-indigo-700 border-indigo-200'
		case 'Assessment':
			return 'bg-sky-50 text-sky-700 border-sky-200'
		case 'Archived':
			return 'bg-slate-100 text-slate-500 border-slate-200'
		case 'Search':
		default:
			return 'bg-slate-100 text-slate-700 border-slate-200/60'
	}
}

const JobList = ({ 
	jobs, 
	onEdit, 
	onDelete, 
	onAssess, 
	onOpenNotes,
	onQuickUpdate, 
} : JobListProps) => {

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

	const handleStageChange = (job: Job, nextStage: string) => {
		if (!onQuickUpdate) return

		if (nextStage === 'Interviewing') {
			onQuickUpdate(job, {
			stage: nextStage,
			interview_round: job.interview_round > 0 ? job.interview_round : 1,
			})
		} else if (job.stage === 'Interviewing' || job.interview_round > 0) {
			onQuickUpdate(job, {
			stage: nextStage,
			interview_round: 0,
			})
		} else {
			onQuickUpdate(job, { stage: nextStage })
		}
	}

	const handleRoundChange = (job: Job, rawValue: string) => {
		if (!onQuickUpdate) return

		const parsed = Math.max(1, parseInt(rawValue, 10) || 1)
		onQuickUpdate(job, { interview_round: parsed })
	}

	const handleStatusChange = (job: Job, nextStatus: string) => {
		if (!onQuickUpdate) return
		onQuickUpdate(job, { status: nextStatus })
	}

	return (
		<ul className="space-y-3">
			{jobs.map((job) => {
				const hasAssessment = job.assessment_total_score !== null && job.assessment_total_score !== undefined

				const notesCount = job.notes_count ?? 0

				const stageLabel =
					job.stage === 'Interviewing' && job.interview_round > 0
						? `Stage: ${job.stage} (Round ${job.interview_round})`
						: `Stage: ${job.stage}`

				const lifecycleDates = [
					{ label: 'Posted', value: job.date_posted },
					{ label: 'Found', value: job.date_found },
					{ label: 'Assessed', value: job.date_assessed },
					{ label: 'Applied', value: job.date_applied },
				].filter((d) => Boolean(d.value))

				const hasLinks = Boolean(job.url || job.resume_url || job.cover_letter_url)

				return (
					<li
						key={job.id}
						className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all gap-4">
							<div className="space-y-2 min-w-0 flex-1">
								{/* Title, Company, and Assessment Badge */}
								<div className="flex items-center gap-2.5 flex-wrap">
									<div className="text-sm">
										<strong className="font-semibold text-slate-900">{job.company}</strong>
										<span className="text-slate-400 mx-1.5">—</span>
										<span className="text-slate-700">{job.title}</span>
									</div>

									{hasAssessment && (
										<AssessmentBadge
											totalScore={job.assessment_total_score!}
											recommendation={job.assessment_recommendation!}
											onClick={onAssess ? () => onAssess(job) : undefined}
										/>
									)}
								</div>

								{/* Pipeline Stage, Status, Arrangement, Location, and Sourcing */}
								<div className="flex items-center gap-2 flex-wrap text-xs">
									{onQuickUpdate ? (
										<>
											<select
												aria-label={`Stage for ${job.company}`}
												value={job.stage}
												onChange={(e) => handleStageChange(job, e.target.value)}
												className={`px-2 py-0.5 rounded-md font-medium border cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-colors ${getStageBadgeStyle(
													job.stage
												)}`}>
													{JOB_STAGES.map((stage) => (
														<option key={stage} value={stage}>
														{stage}
														</option>
													))}
											</select>

											{job.stage === 'Interviewing' && (
												<label className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border border-indigo-200 bg-indigo-50/70 text-indigo-700">
													<span>Round</span>

													<input
														type="number"
														min={1}
														aria-label={`Interview round for ${job.company}`}
														value={job.interview_round || 1}
														onChange={(e) => handleRoundChange(job, e.target.value)}
														className="w-10 px-1 py-0 text-center text-xs font-semibold bg-white border border-indigo-200 rounded text-indigo-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"/>
												</label>
											)}

											<select
												aria-label={`Status for ${job.company}`}
												value={job.status}
												onChange={(e) => handleStatusChange(job, e.target.value)}
												className={`px-2 py-0.5 rounded-md font-medium border cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-colors ${getStatusBadgeStyle(
													job.status
												)}`} >
													{JOB_STATUSES.map((status) => (
														<option key={status} value={status}>
														{status}
														</option>
													))}
											</select>
										</>
									) : (
										<>
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${getStageBadgeStyle(
													job.stage
												)}`}>
													{stageLabel}
											</span>

											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${getStatusBadgeStyle(
													job.status
												)}`} >
													Status: {job.status}
											</span>
										</>
									)}

									{job.work_arrangement && (
										<span className="text-slate-600 font-medium">{job.work_arrangement}</span>
									)}

									{job.location && <span className="text-slate-400">({job.location})</span>}

									{job.source && (
										<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/70">
											Source: {job.source}
										</span>
									)}

									{job.application_platform && (
										<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/70">
											Via: {job.application_platform}
										</span>
									)}
								</div>

								{/* Lifecycle Dates */}
								{lifecycleDates.length > 0 && (
									<div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-slate-500">
										{lifecycleDates.map((d) => (
											<span key={d.label}>
												<span className="font-medium text-slate-600">{d.label}:</span> {d.value}
											</span>
										))}
									</div>
								)}

								{/* Resource Links (Posting, Resume, Cover Letter) */}
								{hasLinks && (
									<div className="flex items-center gap-3 flex-wrap pt-0.5 text-xs">
										{job.url && (
											<a
												href={job.url}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 hover:underline">
													<span>View Posting</span>
													<span aria-hidden="true">↗</span>
											</a>
										)}

										{job.resume_url && (
											<a
												href={job.resume_url}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 hover:underline">
													<span>Resume</span>
													<span aria-hidden="true">↗</span>
											</a>
										)}

										{job.cover_letter_url && (
											<a
												href={job.cover_letter_url}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 hover:underline">
													<span>Cover Letter</span>
													<span aria-hidden="true">↗</span>
											</a>
										)}
									</div>
								)}

								{/* Optional Summary Notes */}
								{job.notes && (
									<p className="text-xs text-slate-600 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 leading-relaxed whitespace-pre-wrap">
										{job.notes}
									</p>
								)}
							</div>

							{/* Action Buttons Toolbar */}
							<div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
								{onOpenNotes && (
									<button
										type="button"
										onClick={() => onOpenNotes(job)}
										className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
											{notesCount > 0 ? `Notes (${notesCount})` : 'Notes'}
									</button>
								)}

								{onAssess && (
									<button
										type="button"
										onClick={() => onAssess(job)}
										className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer">
											{hasAssessment ? 'Re-assess' : 'Assess'}
									</button>
								)}

								{onEdit && (
									<button
										type="button"
										onClick={() => onEdit(job)}
										className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
											Edit
									</button>
								)}

								{onDelete && (
									<button
										type="button"
										onClick={() => onDelete(job)}
										className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors cursor-pointer">
											Delete
									</button>
								)}
							</div>
					</li>
				)
			})}
		</ul>
	)
}

export default JobList