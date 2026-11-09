import React, { useState } from 'react'

export interface CreateJobInput {
	company: string
	title: string
	location?: string
	work_arrangement?: string
	url?: string
	stage?: string
	status?: string
	notes?: string
}

interface CreateJobFormProps {
	onSubmit: (job: CreateJobInput) => void
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

const CreateJobForm = ({ onSubmit }: CreateJobFormProps) => {
		const [company, setCompany] = useState('')
		const [title, setTitle] = useState('')
		const [location, setLocation] = useState('')
		const [workArrangement, setWorkArrangement] = useState('')
		const [url, setUrl] = useState('')
		const [stage, setStage] = useState('Search')
		const [status, setStatus] = useState('Active')
		const [notes, setNotes] = useState('')

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
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

		setCompany('')
		setTitle('')
		setLocation('')
		setWorkArrangement('')
		setUrl('')
		setStage('Search')
		setStatus('Active')
		setNotes('')
	}

	return (
		<form
			onSubmit={handleSubmit}>
				<div>
					<label 
						htmlFor="company">
							Company
					</label>

					<input 
						id='company'
						type="text"
						value={company}
						required
						onChange={
							(e) => setCompany(e.target.value)
						} />
				</div>

				<div>
					<label 
						htmlFor="title">
							Title
					</label>

					<input 
						id='title'
						type="text"
						value={title}
						required
						onChange={
							(e) => setTitle(e.target.value)
						} />
				</div>

				<div>
					<label 
						htmlFor="location">
							Location
					</label>

					<input 
						id='location'
						type="text"
						value={location}
						placeholder='e.g. San Francisco, CA'
						onChange={
							(e) => setLocation(e.target.value)
						} />
				</div>

				<div>
					<label 
						htmlFor="work-arrangement">
							Work Arrangement
					</label>

					<select 
						id='work-arrangement'
						value={workArrangement}
						onChange={
							(e) => setWorkArrangement(e.target.value)
						} >
							<option
								value="">
									Select Arrangement
							</option>

							{WORK_ARRANGEMENT_OPTIONS.filter(Boolean).map((arrangement) => (
								<option 
									key={arrangement}
									value={arrangement}>
										{arrangement}
								</option>
							))}
					</select>
				</div>

				<div>
					<label 
						htmlFor="url">
							Job Posting URL
					</label>

					<input 
						id='url'
						type="url"
						value={url}
						placeholder='https://...'
						onChange={
							(e) => setUrl(e.target.value)
						} />
				</div>

				<div>
					<label 
						htmlFor="stage">
							Stage
					</label>

					<select 
						id='stage'
						value={stage}
						onChange={
							(e) => setStage(e.target.value)
						} >
							{STAGE_OPTIONS.map((opt) => (
								<option 
									key={opt}
									value={opt}>
										{opt}
								</option>
							))}
					</select>
				</div>

				<div>
					<label 
						htmlFor="status">
							Status
					</label>

					<select 
						id='status'
						value={status}
						onChange={
							(e) => setStatus(e.target.value)
						} >
							{STATUS_OPTIONS.map((opt) => (
								<option 
									key={opt}
									value={opt}>
										{opt}
								</option>
							))}
					</select>
				</div>

				<div>
					<label 
						htmlFor="notes">
							Notes
					</label>

					<textarea  
						id="notes"
						value={notes}
						rows={3}
						onChange={
							(e) => setNotes(e.target.value)
						} />
				</div>

				<button
					type='submit'>
						Add Job
				</button>
		</form>
	)
}

export default CreateJobForm