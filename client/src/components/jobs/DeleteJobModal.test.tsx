import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import type { Job } from './JobList'
import DeleteJobModal from './DeleteJobModal'

describe('DeleteJobModal', () => {
	const targetJob: Job = {
		id: 42,
		company: 'Amazon',
		title: 'DevOps Engineer',
		stage: 'Applied',
		status: 'Active'
	}

	it('renders confirmation text with the target job details', () => {
		render(
			<DeleteJobModal 
				job={targetJob}
				onConfirm={vi.fn()}
				onCancel={vi.fn()} 
			/>
		)

		expect(screen.getByText(/are you sure you want to delete/i)).toBeDefined()
		expect(screen.getByText(/Amazon/)).toBeDefined()
		expect(screen.getByText(/DevOps Engineer/)).toBeDefined()
	})

	it('calls onCancel when the cancel button is clicked', () => {
		const handleCancel = vi.fn()

		render(
			<DeleteJobModal 
				job={targetJob}
				onConfirm={vi.fn()}
				onCancel={handleCancel} 
			/>
		)

		const cancelButton = screen.getByRole('button', { name: /cancel/i })
		fireEvent.click(cancelButton)

		expect(handleCancel).toHaveBeenCalledTimes(1)
	})

	it('calls onConfirm with the job ID when confirmed', () => {
		const handleConfirm = vi.fn()

		render(
			<DeleteJobModal 
				job={targetJob}
				onConfirm={handleConfirm}
				onCancel={vi.fn()} 
			/>
		)

		const confirmButton = screen.getByRole('button', { name: /delete job/i })
		fireEvent.click(confirmButton)

		expect(handleConfirm).toHaveBeenCalledWith(42)
	})
})