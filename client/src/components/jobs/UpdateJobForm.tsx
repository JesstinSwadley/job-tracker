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

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor="company">Company</label>
				<input
					id="company"
					type="text"
					value={company}
					onChange={(e) => setCompany(e.target.value)}
					required
				/>
			</div>

			<div>
				<label htmlFor="title">Title</label>
				<input
					id="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			<div>
				<label htmlFor="location">Location</label>
				<input
					id="location"
					type="text"
					value={location}
					placeholder="e.g. Mountain View, CA"
					onChange={(e) => setLocation(e.target.value)}
				/>
			</div>

			<div>
				<label htmlFor="work-arrangement">Work Arrangement</label>
				<select
					id="work-arrangement"
					value={workArrangement}
					onChange={(e) => setWorkArrangement(e.target.value)}
				>
					<option value="">Select Arrangement</option>
					{WORK_ARRANGEMENT_OPTIONS.filter(Boolean).map((arrangement) => (
						<option key={arrangement} value={arrangement}>
							{arrangement}
						</option>
					))}
				</select>
			</div>

			<div>
				<label htmlFor="url">Job Posting URL</label>
				<input
					id="url"
					type="url"
					value={url}
					placeholder="https://..."
					onChange={(e) => setUrl(e.target.value)}
				/>
			</div>

			<div>
				<label htmlFor="stage">Stage</label>
				<select
					id="stage"
					value={stage}
					onChange={(e) => setStage(e.target.value)}
				>
					{STAGE_OPTIONS.map((opt) => (
						<option key={opt} value={opt}>
							{opt}
						</option>
					))}
				</select>
			</div>

			<div>
				<label htmlFor="status">Status</label>
				<select
					id="status"
					value={status}
					onChange={(e) => setStatus(e.target.value)}
				>
					{STATUS_OPTIONS.map((opt) => (
						<option key={opt} value={opt}>
							{opt}
						</option>
					))}
				</select>
			</div>

			<div>
				<label htmlFor="notes">Notes</label>
				<textarea
					id="notes"
					value={notes}
					rows={3}
					onChange={(e) => setNotes(e.target.value)}
				/>
			</div>

			<div>
				<button type="submit">Save Changes</button>
				<button type="button" onClick={onCancel}>
					Cancel
				</button>
			</div>
		</form>
	)
}

export default UpdateJobForm