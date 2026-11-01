import React from 'react'

export interface Job {
	id: number
	company: string
	position: string
	status: string
}

interface JobListProps {
	jobs: Job[]
	onEdit?: (job: Job) => void
}

const JobList = ({ jobs, onEdit }: JobListProps) => {
	if (jobs.length === 0) {
		return <p>No jobs tracked yet.</p>
	}

	return (
		<ul>
			{jobs.map((job) => (
				<li
					key={job.id}>
						<span>{job.company}</span> - <span>{job.position}</span> [
							<span>{job.status}</span>
						]
					
					{onEdit && (
						<button
							type='button'
							onClick={() => onEdit(job)}
							style={{ marginLeft: '1rem' }}>
								Edit
						</button>
					)}
				</li>
			))}
		</ul>
	)
}

export default JobList