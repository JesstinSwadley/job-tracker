import React from 'react'

export interface Job {
	id: number
	company: string
	position: string
	status: string
}

interface JobListProps {
	jobs: Job[]
}

const JobList = ({ jobs }: JobListProps) => {
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
				</li>
			))}
		</ul>
	)
}

export default JobList