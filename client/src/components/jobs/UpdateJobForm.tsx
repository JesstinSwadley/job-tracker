import React, { useState } from 'react'
import type { Job } from './JobList'

export interface UpdateJobInput {
	company: string
	title: string
	location?: string
	work_arrangement?: string
	url?: string
	stage?: string
	status?: string
	notes?: string
}

interface UpdateJobFormProps {
	job: Job
	onSubmit: (data: UpdateJobInput) => void
	onCancel: () => void
}

const STAGE_OPTIONS = [
	'Search',
	'Applied',
	'Screening',
	'Interview 1',
	'Interview 2',
	'Final Round',
	'Offer',
	'Archived'
]

const STATUS_OPTIONS = [
	'Active',
	'Interviewing',
	'Rejected',
	'Offer',
	'Withdrawn'
]

const WORK_ARRANGEMENT_OPTIONS = [
	'',
	'Remote',
	'Hybrid',
	'Onsite'
]

const UpdateJobForm = ({ job, onSubmit, onCancel }: UpdateJobFormProps) => {
	const [company, setCompany] = useState(job.company)
	const [title, setTitle] = useState(job.title)
	const [location, setLocation] = useState(job.location || '')
	const [workArrangement, setWorkArrangement] = useState(job.work_arrangement || '')
	const [url, setUrl] = useState(job.url || '')
	const [stage, setStage] = useState(job.stage || 'Search')
	const [status, setStatus] = useState(job.status || 'Active')
	const [notes, setNotes] = useState(job.notes || '')

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const trimmedCompany = company.trim()
		const trimmedTitle = title.trim()

		if (!trimmedCompany || !trimmedTitle) {
			return
		}

		onSubmit({
			company: trimmedCompany,
			title: trimmedTitle,
			location: location.trim(),
			work_arrangement: workArrangement,
			url: url.trim(),
			stage,
			status,
			notes: notes.trim()
		})
	}

	const inputClasses =
		'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors'
	const labelClasses = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5'

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Company */}
				<div>
					<label htmlFor="company" className={labelClasses}>
						Company <span className="text-rose-500">*</span>
					</label>
					<input
						id="company"
						type="text"
						value={company}
						required
						onChange={(e) => setCompany(e.target.value)}
						className={inputClasses}
					/>
				</div>

				{/* Title */}
				<div>
					<label htmlFor="title" className={labelClasses}>
						Title <span className="text-rose-500">*</span>
					</label>
					<input
						id="title"
						type="text"
						value={title}
						required
						onChange={(e) => setTitle(e.target.value)}
						className={inputClasses}
					/>
				</div>

				{/* Location */}
				<div>
					<label htmlFor="location" className={labelClasses}>
						Location
					</label>
					<input
						id="location"
						type="text"
						value={location}
						placeholder="e.g. Mountain View, CA"
						onChange={(e) => setLocation(e.target.value)}
						className={inputClasses}
					/>
				</div>

				{/* Work Arrangement */}
				<div>
					<label htmlFor="work-arrangement" className={labelClasses}>
						Work Arrangement
					</label>
					<select
						id="work-arrangement"
						value={workArrangement}
						onChange={(e) => setWorkArrangement(e.target.value)}
						className={inputClasses}
					>
						<option value="">Select Arrangement</option>
						{WORK_ARRANGEMENT_OPTIONS.filter(Boolean).map((arrangement) => (
							<option key={arrangement} value={arrangement}>
								{arrangement}
							</option>
						))}
					</select>
				</div>

				{/* Stage */}
				<div>
					<label htmlFor="stage" className={labelClasses}>
						Stage
					</label>
					<select
						id="stage"
						value={stage}
						onChange={(e) => setStage(e.target.value)}
						className={inputClasses}
					>
						{STAGE_OPTIONS.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				</div>

				{/* Status */}
				<div>
					<label htmlFor="status" className={labelClasses}>
						Status
					</label>
					<select
						id="status"
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className={inputClasses}
					>
						{STATUS_OPTIONS.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				</div>

				{/* URL */}
				<div className="sm:col-span-2">
					<label htmlFor="url" className={labelClasses}>
						Job Posting URL
					</label>
					<input
						id="url"
						type="url"
						value={url}
						placeholder="https://..."
						onChange={(e) => setUrl(e.target.value)}
						className={inputClasses}
					/>
				</div>

				{/* Notes */}
				<div className="sm:col-span-2">
					<label htmlFor="notes" className={labelClasses}>
						Notes
					</label>
					<textarea
						id="notes"
						value={notes}
						rows={3}
						placeholder="Salary details, interview rounds, referral context..."
						onChange={(e) => setNotes(e.target.value)}
						className={`${inputClasses} resize-y`}
					/>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center justify-end gap-3 pt-2">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
				>
					Save Changes
				</button>
			</div>
		</form>
	)
}

export default UpdateJobForm