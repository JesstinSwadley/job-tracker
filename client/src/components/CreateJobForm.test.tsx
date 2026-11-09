import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CreateJobForm from './CreateJobForm'

describe('CreateJobForm', () => {
	it('submits company and title with default stage and status', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		const companyInput = screen.getByLabelText(/company/i)
		const titleInput = screen.getByLabelText(/title/i)
		const submitButton = screen.getByRole('button', { name: /add job/i })

		fireEvent.change(companyInput, { target: { value: 'Stripe' } })
		fireEvent.change(titleInput, { target: { value: 'Backend Engineer' } })
		fireEvent.click(submitButton)

		expect(handleSubmit).toHaveBeenCalledOnce()
		expect(handleSubmit).toHaveBeenCalledWith({
			company: 'Stripe',
			title: 'Backend Engineer',
			location: '',
			work_arrangement: '',
			url: '',
			stage: 'Search',
			status: 'Active',
			notes: ''
		})
	})

	it('submits custom values for all optional fields', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		fireEvent.change(screen.getByLabelText(/^company/i), { target: { value: 'GitHub' } })
		fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: 'Senior Go Developer' } })
		fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Remote, US' } })
		fireEvent.change(screen.getByLabelText(/work arrangement/i), { target: { value: 'Remote' } })
		fireEvent.change(screen.getByLabelText(/job posting url/i), { target: { value: 'https://github.careers/job/123' } })
		fireEvent.change(screen.getByLabelText(/stage/i), { target: { value: 'Applied' } })
		fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'Interviewing' } })
		fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Referred by team lead.' } })

		fireEvent.click(screen.getByRole('button', { name: /add job/i }))

		expect(handleSubmit).toHaveBeenCalledOnce()
		expect(handleSubmit).toHaveBeenCalledWith({
			company: 'GitHub',
			title: 'Senior Go Developer',
			location: 'Remote, US',
			work_arrangement: 'Remote',
			url: 'https://github.careers/job/123',
			stage: 'Applied',
			status: 'Interviewing',
			notes: 'Referred by team lead.'
		})
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

	it('resets inputs back to initial state after successful submit', () => {
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		const companyInput = screen.getByLabelText(/^company/i) as HTMLInputElement
		const titleInput = screen.getByLabelText(/^title/i) as HTMLInputElement
		const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement
		const submitButton = screen.getByRole('button', { name: /add job/i })

		fireEvent.change(companyInput, { target: { value: 'Acme Corp' } })
		fireEvent.change(titleInput, { target: { value: 'Systems Architect' } })
		fireEvent.change(notesInput, { target: { value: 'Follow up next Tuesday' } })
		fireEvent.click(submitButton)

		expect(companyInput.value).toBe('')
		expect(titleInput.value).toBe('')
		expect(notesInput.value).toBe('')
	})
})