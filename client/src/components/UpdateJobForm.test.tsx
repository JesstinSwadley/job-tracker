import { describe, expect, vi, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import type { Job } from './JobList'
import UpdateJobForm, { type UpdateJobInput } from './UpdateJobForm'

describe('UpdateJobForm', () => {
    const existingJob: Job = {
        id: 1,
        company: 'Google',
        title: 'Web Developer',
        location: 'Mountain View, CA',
        work_arrangement: 'Hybrid',
        url: 'https://careers.google.com/jobs/1',
        stage: 'Screening',
        status: 'Interviewing',
        notes: 'HR screen scheduled for Friday.'
    }

    it('pre-populates form fields with the existing job details', () => {
        render(<UpdateJobForm job={existingJob} onSubmit={vi.fn()} onCancel={vi.fn()} />)

        expect(screen.getByDisplayValue('Google')).toBeDefined()
        expect(screen.getByDisplayValue('Web Developer')).toBeDefined()
        expect(screen.getByDisplayValue('Mountain View, CA')).toBeDefined()
        expect(screen.getByDisplayValue('Hybrid')).toBeDefined()
        expect(screen.getByDisplayValue('https://careers.google.com/jobs/1')).toBeDefined()
        expect(screen.getByDisplayValue('Screening')).toBeDefined()
        expect(screen.getByDisplayValue('Interviewing')).toBeDefined()
        expect(screen.getByDisplayValue('HR screen scheduled for Friday.')).toBeDefined()
    })

    it('submits updated values when fields are modified', () => {
        const handleSubmit = vi.fn()

        render(<UpdateJobForm job={existingJob} onSubmit={handleSubmit} onCancel={vi.fn()} />)

        const titleInput = screen.getByLabelText(/title/i)
        const stageSelect = screen.getByLabelText(/stage/i)
        const notesInput = screen.getByLabelText(/notes/i)
        const submitButton = screen.getByRole('button', { name: /save changes/i })

        fireEvent.change(titleInput, { target: { value: 'Senior Software Engineer' } })
        fireEvent.change(stageSelect, { target: { value: 'Interview 1' } })
        fireEvent.change(notesInput, { target: { value: 'Technical interview next week' } })
        fireEvent.click(submitButton)

        const expectedPayload: UpdateJobInput = {
            company: 'Google',
            title: 'Senior Software Engineer',
            location: 'Mountain View, CA',
            work_arrangement: 'Hybrid',
            url: 'https://careers.google.com/jobs/1',
            stage: 'Interview 1',
            status: 'Interviewing',
            notes: 'Technical interview next week'
        }

        expect(handleSubmit).toHaveBeenCalledWith(expectedPayload)
    })

    it('does not submit when required fields are cleared or contain only whitespace', () => {
        const handleSubmit = vi.fn()

        render(<UpdateJobForm job={existingJob} onSubmit={handleSubmit} onCancel={vi.fn()} />)

        const titleInput = screen.getByLabelText(/title/i)
        const submitButton = screen.getByRole('button', { name: /save changes/i })

        // Clear required title input
        fireEvent.change(titleInput, { target: { value: '   ' } })
        fireEvent.click(submitButton)

        expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('calls onCancel when the cancel button is clicked', () => {
        const handleCancel = vi.fn()
        render(<UpdateJobForm job={existingJob} onSubmit={vi.fn()} onCancel={handleCancel} />)

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        fireEvent.click(cancelButton)

        expect(handleCancel).toHaveBeenCalledTimes(1)
    })
})