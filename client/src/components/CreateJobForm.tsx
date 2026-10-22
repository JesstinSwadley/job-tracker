import React, { useState } from 'react'

export interface CreateJobInput {
	company: string
	position: string
	status: string
}

interface CreateJobFormProps {
	onSubmit: (job: CreateJobInput) => void
}

const CreateJobForm = ({ onSubmit }: CreateJobFormProps) => {
	const [company, setCompany] = useState('')
	const [position, setPosition] = useState('')

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!company.trim() || !position.trim()) {
			return
		}

		onSubmit({
			company,
			position,
			status: 'Applied'
		})

		setCompany('')
		setPosition('')
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
						htmlFor="position">
							Position
					</label>

					<input 
						id='position'
						type="text"
						value={position}
						required
						onChange={
							(e) => setPosition(e.target.value)
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