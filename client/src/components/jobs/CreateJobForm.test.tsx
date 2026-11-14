import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CreateJobForm from './CreateJobForm'

describe('CreateJobForm', () => {
	it('submits company and title with default stage, round, and status', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		fireEvent.change(screen.getByLabelText(/^company/i), { target: { value: 'Stripe' } })
		fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: 'Backend Engineer' } })
		fireEvent.click(screen.getByRole('button', { name: /add job/i }))

		expect(handleSubmit).toHaveBeenCalledOnce()
		expect(handleSubmit).toHaveBeenCalledWith({
		company: 'Stripe',
		title: 'Backend Engineer',
		location: '',
		work_arrangement: '',
		source: '',
		application_platform: '',
		url: '',
		stage: 'Search',
		interview_round: 0,
		status: 'Active',
		date_posted: '',
		date_found: '',
		date_assessed: '',
		date_applied: '',
		resume_url: '',
		cover_letter_url: '',
		notes: '',
		})
	})

	it('submits custom values for all optional fields including interview round, dates, and doc links', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		fireEvent.change(screen.getByLabelText(/^company/i), { target: { value: 'GitHub' } })
		fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: 'Senior Go Developer' } })
		fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Remote, US' } })
		fireEvent.change(screen.getByLabelText(/work arrangement/i), { target: { value: 'Remote' } })

		fireEvent.change(screen.getByLabelText(/stage/i), { target: { value: 'Interviewing' } })
		fireEvent.change(screen.getByLabelText(/interview round/i), { target: { value: '2' } })
		fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'Active' } })

		fireEvent.change(screen.getByLabelText(/discovery source/i), { target: { value: 'Referral' } })
		fireEvent.change(screen.getByLabelText(/application platform/i), {
		target: { value: 'Greenhouse' },
		})
		fireEvent.change(screen.getByLabelText(/job posting url/i), {
		target: { value: 'https://github.careers/job/123' },
		})
		fireEvent.change(screen.getByLabelText(/resume url/i), {
		target: { value: 'https://docs.google.com/document/d/resume-123' },
		})
		fireEvent.change(screen.getByLabelText(/cover letter url/i), {
		target: { value: 'https://docs.google.com/document/d/cover-123' },
		})

		fireEvent.change(screen.getByLabelText(/date posted/i), { target: { value: '2026-11-01' } })
		fireEvent.change(screen.getByLabelText(/date found/i), { target: { value: '2026-11-02' } })
		fireEvent.change(screen.getByLabelText(/date assessed/i), { target: { value: '2026-11-03' } })
		fireEvent.change(screen.getByLabelText(/date applied/i), { target: { value: '2026-11-04' } })
		fireEvent.change(screen.getByLabelText(/summary notes/i), {
		target: { value: 'Referred by team lead.' },
		})

		fireEvent.click(screen.getByRole('button', { name: /add job/i }))

		expect(handleSubmit).toHaveBeenCalledOnce()
		expect(handleSubmit).toHaveBeenCalledWith({
		company: 'GitHub',
		title: 'Senior Go Developer',
		location: 'Remote, US',
		work_arrangement: 'Remote',
		source: 'Referral',
		application_platform: 'Greenhouse',
		url: 'https://github.careers/job/123',
		stage: 'Interviewing',
		interview_round: 2,
		status: 'Active',
		date_posted: '2026-11-01',
		date_found: '2026-11-02',
		date_assessed: '2026-11-03',
		date_applied: '2026-11-04',
		resume_url: 'https://docs.google.com/document/d/resume-123',
		cover_letter_url: 'https://docs.google.com/document/d/cover-123',
		notes: 'Referred by team lead.',
		})
	})

	it('shows interview round input only when stage is Interviewing and resets round when changed away', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		expect(screen.queryByLabelText(/interview round/i)).toBeNull()

		const stageSelect = screen.getByLabelText(/stage/i)
		fireEvent.change(stageSelect, { target: { value: 'Interviewing' } })

		const roundInput = screen.getByLabelText(/interview round/i) as HTMLInputElement
		expect(roundInput).toBeDefined()
		expect(roundInput.value).toBe('1')

		fireEvent.change(stageSelect, { target: { value: 'Offer' } })
		expect(screen.queryByLabelText(/interview round/i)).toBeNull()

		fireEvent.change(screen.getByLabelText(/^company/i), { target: { value: 'Linear' } })
		fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: 'Product Engineer' } })
		fireEvent.click(screen.getByRole('button', { name: /add job/i }))

		expect(handleSubmit).toHaveBeenCalledWith(
		expect.objectContaining({
			stage: 'Offer',
			interview_round: 0,
		})
		)
	})

	it('does not submit when required fields are empty or whitespace only', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		const submitButton = screen.getByRole('button', { name: /add job/i })

		// Empty submission
		fireEvent.click(submitButton)
		expect(handleSubmit).not.toHaveBeenCalled()

		// Whitespace-only submission
		fireEvent.change(screen.getByLabelText(/^company/i), { target: { value: '   ' } })
		fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: '   ' } })
		fireEvent.click(submitButton)
		expect(handleSubmit).not.toHaveBeenCalled()
	})

	it('resets all inputs back to initial state after successful submit', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		const companyInput = screen.getByLabelText(/^company/i) as HTMLInputElement
		const titleInput = screen.getByLabelText(/^title/i) as HTMLInputElement
		const sourceSelect = screen.getByLabelText(/discovery source/i) as HTMLSelectElement
		const stageSelect = screen.getByLabelText(/stage/i) as HTMLSelectElement
		const dateAppliedInput = screen.getByLabelText(/date applied/i) as HTMLInputElement
		const notesInput = screen.getByLabelText(/summary notes/i) as HTMLTextAreaElement

		fireEvent.change(companyInput, { target: { value: 'Acme Corp' } })
		fireEvent.change(titleInput, { target: { value: 'Systems Architect' } })
		fireEvent.change(sourceSelect, { target: { value: 'LinkedIn' } })
		fireEvent.change(stageSelect, { target: { value: 'Interviewing' } })
		fireEvent.change(dateAppliedInput, { target: { value: '2026-11-10' } })
		fireEvent.change(notesInput, { target: { value: 'Follow up next Tuesday' } })

		fireEvent.click(screen.getByRole('button', { name: /add job/i }))

		expect(companyInput.value).toBe('')
		expect(titleInput.value).toBe('')
		expect(sourceSelect.value).toBe('')
		expect(stageSelect.value).toBe('Search')
		expect(screen.queryByLabelText(/interview round/i)).toBeNull()
		expect(dateAppliedInput.value).toBe('')
		expect(notesInput.value).toBe('')
	})
})