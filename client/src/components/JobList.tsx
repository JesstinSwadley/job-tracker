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
	onDelete?: (job: Job) => void
}

const JobList = ({ jobs, onEdit, onDelete }: JobListProps) => {
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
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0.5rem 0',
						borderBottom: '1px solid #eee'
					}}>
						<div>qc
							<strong>{job.company}</strong> - <span>{job.position}</span> [{job.status}]
						</div>
					
						<div
							style={{ 
								display: 'flex',
								gap: '0.5rem'
							}}>
								{onEdit && (
									<button
										type='button'
										onClick={() => onEdit(job)}>
											Edit
									</button>
								)}

								{onDelete && (
									<button
										type='button'
										onClick={() => onDelete(job)}
										style={{ color: '#dc2626'}}>
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