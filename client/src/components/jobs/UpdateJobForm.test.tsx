import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Job, UpdateJobInput } from '../../types'
import UpdateJobForm from './UpdateJobForm'

describe('UpdateJobForm', () => {
	const existingJob: Job = {
		id: 1,
		company: 'Google',
		title: 'Web Developer',
		location: 'Mountain View, CA',
		work_arrangement: 'Hybrid',
		source: 'Referral',
		application_platform: 'Workday',
		url: 'https://careers.google.com/jobs/1',
		stage: 'Assessment',
		interview_round: 0,
		status: 'Active',
		date_posted: '2026-11-01',
		date_found: '2026-11-02',
		date_assessed: '2026-11-03',
		date_applied: '2026-11-04',
		resume_url: 'https://docs.google.com/document/d/resume-1',
		cover_letter_url: 'https://docs.google.com/document/d/cl-1',
		notes: 'HR screen scheduled for Friday.',
		assessment_total_score: 86,
		assessment_recommendation: 'Apply - Priority',
		notes_count: 1,
	}

	it('pre-populates form fields with the existing job details', () => {
		render(<UpdateJobForm job={existingJob} onSubmit={vi.fn()} onCancel={vi.fn()} />)

		expect(screen.getByDisplayValue('Google')).toBeDefined()
		expect(screen.getByDisplayValue('Web Developer')).toBeDefined()
		expect(screen.getByDisplayValue('Mountain View, CA')).toBeDefined()
		expect(screen.getByDisplayValue('Hybrid')).toBeDefined()
		expect(screen.getByDisplayValue('Referral')).toBeDefined()
		expect(screen.getByDisplayValue('Workday')).toBeDefined()
		expect(screen.getByDisplayValue('https://careers.google.com/jobs/1')).toBeDefined()
		expect(screen.getByDisplayValue('Assessment')).toBeDefined()
		expect(screen.getByDisplayValue('Active')).toBeDefined()
		expect(screen.getByDisplayValue('2026-11-01')).toBeDefined()
		expect(screen.getByDisplayValue('2026-11-02')).toBeDefined()
		expect(screen.getByDisplayValue('2026-11-03')).toBeDefined()
		expect(screen.getByDisplayValue('2026-11-04')).toBeDefined()
		expect(screen.getByDisplayValue('https://docs.google.com/document/d/resume-1')).toBeDefined()
		expect(screen.getByDisplayValue('https://docs.google.com/document/d/cl-1')).toBeDefined()
		expect(screen.getByDisplayValue('HR screen scheduled for Friday.')).toBeDefined()
		expect(screen.queryByLabelText(/interview round/i)).toBeNull()
	})

	it('submits updated values when fields are modified including interview round', () => {
		const handleSubmit = vi.fn()

		render(<UpdateJobForm job={existingJob} onSubmit={handleSubmit} onCancel={vi.fn()} />)

		fireEvent.change(screen.getByLabelText(/^title/i), {
		target: { value: 'Senior Software Engineer' },
		})
		fireEvent.change(screen.getByLabelText(/stage/i), { target: { value: 'Interviewing' } })
		fireEvent.change(screen.getByLabelText(/interview round/i), { target: { value: '2' } })
		fireEvent.change(screen.getByLabelText(/application platform/i), {
		target: { value: 'Greenhouse' },
		})
		fireEvent.change(screen.getByLabelText(/summary notes/i), {
		target: { value: 'Technical interview next week' },
		})
		fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

		const expectedPayload: UpdateJobInput = {
		company: 'Google',
		title: 'Senior Software Engineer',
		location: 'Mountain View, CA',
		work_arrangement: 'Hybrid',
		source: 'Referral',
		application_platform: 'Greenhouse',
		url: 'https://careers.google.com/jobs/1',
		stage: 'Interviewing',
		interview_round: 2,
		status: 'Active',
		date_posted: '2026-11-01',
		date_found: '2026-11-02',
		date_assessed: '2026-11-03',
		date_applied: '2026-11-04',
		resume_url: 'https://docs.google.com/document/d/resume-1',
		cover_letter_url: 'https://docs.google.com/document/d/cl-1',
		notes: 'Technical interview next week',
		}

		expect(handleSubmit).toHaveBeenCalledOnce()
		expect(handleSubmit).toHaveBeenCalledWith(expectedPayload)
	})

	it('resets interview round to 0 when stage is changed away from Interviewing', () => {
		const handleSubmit = vi.fn()
			const interviewingJob: Job = {
			...existingJob,
			stage: 'Interviewing',
			interview_round: 3,
		}

		render(<UpdateJobForm job={interviewingJob} onSubmit={handleSubmit} onCancel={vi.fn()} />)

		expect((screen.getByLabelText(/interview round/i) as HTMLInputElement).value).toBe('3')

		fireEvent.change(screen.getByLabelText(/stage/i), { target: { value: 'Offer' } })
		expect(screen.queryByLabelText(/interview round/i)).toBeNull()

		fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

		expect(handleSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				stage: 'Offer',
				interview_round: 0,
			})
		)
	})

	it('syncs form fields when the job prop updates', () => {
		const { rerender } = render(
			<UpdateJobForm job={existingJob} onSubmit={vi.fn()} onCancel={vi.fn()} />
		)

		expect(screen.getByDisplayValue('Google')).toBeDefined()

		const nextJob: Job = {
			...existingJob,
			id: 2,
			company: 'Stripe',
			title: 'Staff Infrastructure Engineer',
			source: 'Hacker News',
		}

		rerender(<UpdateJobForm job={nextJob} onSubmit={vi.fn()} onCancel={vi.fn()} />)

		expect(screen.getByDisplayValue('Stripe')).toBeDefined()
		expect(screen.getByDisplayValue('Staff Infrastructure Engineer')).toBeDefined()
		expect(screen.getByDisplayValue('Hacker News')).toBeDefined()
	})

	it('does not submit when required fields are cleared or contain only whitespace', () => {
		const handleSubmit = vi.fn()

		render(<UpdateJobForm job={existingJob} onSubmit={handleSubmit} onCancel={vi.fn()} />)

		fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: '   ' } })
		fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

		expect(handleSubmit).not.toHaveBeenCalled()
	})

	it('calls onCancel when the cancel button is clicked', () => {
		const handleCancel = vi.fn()
		render(<UpdateJobForm job={existingJob} onSubmit={vi.fn()} onCancel={handleCancel} />)

		fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

		expect(handleCancel).toHaveBeenCalledTimes(1)
	})
})