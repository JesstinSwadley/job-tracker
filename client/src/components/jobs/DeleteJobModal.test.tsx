import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Job } from '../../types'
import DeleteJobModal from './DeleteJobModal'

describe('DeleteJobModal', () => {
	const targetJob: Job = {
		id: 42,
		company: 'Amazon',
		title: 'DevOps Engineer',
		location: 'Seattle, WA',
		work_arrangement: 'Hybrid',
		source: 'LinkedIn',
		application_platform: 'Amazon Jobs',
		url: 'https://amazon.jobs/en/jobs/42',
		stage: 'Assessment',
		interview_round: 0,
		status: 'Active',
		date_posted: '2026-11-01',
		date_found: '2026-11-02',
		date_assessed: '',
		date_applied: '',
		resume_url: '',
		cover_letter_url: '',
		notes: '',
		assessment_total_score: null,
		assessment_recommendation: '',
		notes_count: 2,
	}

	it('renders confirmation text with the target job details and cascade warning', () => {
		render(<DeleteJobModal job={targetJob} onConfirm={vi.fn()} onCancel={vi.fn()} />)

		expect(screen.getByText(/are you sure you want to delete/i)).toBeDefined()
		expect(screen.getByText(/Amazon/)).toBeDefined()
		expect(screen.getByText(/DevOps Engineer/)).toBeDefined()
		expect(screen.getByText(/any linked assessment or notes will also be removed/i)).toBeDefined()
	})

	it('calls onCancel when the cancel button is clicked', () => {
		const handleCancel = vi.fn()

		render(<DeleteJobModal job={targetJob} onConfirm={vi.fn()} onCancel={handleCancel} />)

		const cancelButton = screen.getByRole('button', { name: /cancel/i })
		fireEvent.click(cancelButton)

		expect(handleCancel).toHaveBeenCalledTimes(1)
	})

	it('calls onConfirm with the job ID when confirmed', () => {
		const handleConfirm = vi.fn()

		render(<DeleteJobModal job={targetJob} onConfirm={handleConfirm} onCancel={vi.fn()} />)

		const confirmButton = screen.getByRole('button', { name: /delete job/i })
		fireEvent.click(confirmButton)

		expect(handleConfirm).toHaveBeenCalledWith(42)
	})
})