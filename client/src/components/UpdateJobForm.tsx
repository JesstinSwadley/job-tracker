import React, { useState } from 'react'
import type { Job } from './JobList'

export interface UpdateJobInput {
	company: string
	position: string
	status: string
}

interface UpdateJobFormProps {
	job: Job
	onSubmit: (data: UpdateJobInput) => void
	onCancel: () => void
}

const UpdateJobForm = ({ job, onSubmit, onCancel }: UpdateJobFormProps) => {
	const [company, setCompany] = useState(job.company)
	const [position, setPosition] = useState(job.position)
	const [status, setStatus] = useState(job.status)

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		onSubmit({ company, position, status })
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
						onChange={(e) => setCompany(e.target.value)}
						required />
				</div>

				<div>
					<label 
						htmlFor="position">
							Position
					</label>

					<input
						id='position' 
						type="text" 
						value={position}
						onChange={(e) => setPosition(e.target.value)}
						required />
				</div>

				<div>
					<label 
						htmlFor="status">
							Status
					</label>

					<select 
						id='status'
						value={status}
						onChange={(e) => setStatus(e.target.value)}>
							<option 
								value="Applied">
									Applied
							</option>

							<option 
								value="Interviewing">
									Interviewing
							</option>

							<option 
								value="Offer">
									Offer
							</option>

							<option 
								value="Rejected">
									Rejected
							</option>
					</select>
				</div>

				<div>
					<button
						type='submit'>
							Save Changes
					</button>
					
					<button
						type='button'
						onClick={onCancel}>
							Cancel
					</button>
				</div>
		</form>
	)
}

export default UpdateJobForm