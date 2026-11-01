import { describe, expect, vi, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { Job } from "./JobList";
import UpdateJobForm, { type UpdateJobInput } from "./UpdateJobForm";

describe('UpdateJobForm', () => {
	const existingJob: Job = {
		id: 1,
		company: 'Google',
		position: 'Web Developer',
		status: 'Applied',
	}

	it('pre-populates form fields with the existing job details', () => {
		render(<UpdateJobForm job={existingJob} onSubmit={vi.fn()} onCancel={vi.fn()} />)

		expect(screen.getByDisplayValue('Google')).toBeDefined()
		expect(screen.getByDisplayValue('Web Developer')).toBeDefined()
		expect(screen.getByDisplayValue('Applied')).toBeDefined()
	})

	it('submits updated values when fields are modified', () => {
		const handleSubmit = vi.fn()

		render(<UpdateJobForm job={existingJob} onSubmit={handleSubmit} onCancel={vi.fn()} />)

		const positionInput = screen.getByLabelText(/position/i)
		const statusSelect = screen.getByLabelText(/status/i)
		const submitButton = screen.getByRole('button', { name: /save changes/i })

		fireEvent.change(positionInput, { target: { value: 'Senior Software Engineer' } })
		fireEvent.change(statusSelect, { target: { value: 'Interviewing' } })
		fireEvent.click(submitButton)

		const expectedPayload: UpdateJobInput = {
			company: 'Google',
			position: 'Senior Software Engineer',
			status: 'Interviewing',
		}

		expect(handleSubmit).toHaveBeenCalledWith(expectedPayload)
	})

	it('calls onCancel when the cancel button is clicked', () => {
		const handleCancel = vi.fn()
		render(<UpdateJobForm job={existingJob} onSubmit={vi.fn()} onCancel={handleCancel} />)

		const cancelButton = screen.getByRole('button', { name: /cancel/i })
		fireEvent.click(cancelButton)

		expect(handleCancel).toHaveBeenCalledTimes(1)
	})
})