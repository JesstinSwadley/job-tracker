import React from 'react'
import type { Job } from './JobList'

interface DeleteJobModalProps {
	job: Job
	onConfirm: (id: number) => void
	onCancel: () => void
}

const DeleteJobModal = ({ job, onConfirm, onCancel }: DeleteJobModalProps) => {
	return (
		<div
			role="dialog"
			aria-modal="true"
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.4)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
			}}
		>
			<div
				style={{
					backgroundColor: '#fff',
					padding: '1.5rem',
					borderRadius: '8px',
					maxWidth: '400px',
					width: '90%',
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
				}}
			>
				<h3 style={{ marginTop: 0 }}>
					Delete Application
				</h3>

				<p>
					Are you sure you want to delete the <strong>{job.title}</strong> position at <strong>{job.company}</strong>? This action cannot be undone.
				</p>

				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '0.5rem',
						marginTop: '1.5rem'
					}}
				>
					<button
						type="button"
						onClick={onCancel}
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={() => onConfirm(job.id)}
						style={{
							backgroundColor: '#dc2626',
							color: '#fff',
							border: 'none',
							padding: '0.4rem 0.8rem',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Delete Job
					</button>
				</div>
			</div>
		</div>
	)
}

export default DeleteJobModal