import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import JobList, { type Job } from './JobList'

describe('JobList', () => {
	const mockJobs: Job[] = [
		{
			id: 1,
			company: 'Stripe',
			title: 'Backend Engineer',
			location: 'San Francisco, CA',
			work_arrangement: 'Remote',
			url: 'https://stripe.com/jobs/1',
			stage: 'Applied',
			status: 'Active',
			notes: 'Referred by engineering director'
		},
		{
			id: 2,
			company: 'Linear',
			title: 'Frontend Engineer',
			location: 'Remote',
			work_arrangement: 'Remote',
			url: '',
			stage: 'Interview 1',
			status: 'Interviewing',
			notes: ''
		}
	]

	it('renders an empty state when no jobs are present', () => {
		render(<JobList jobs={[]} />)

		expect(screen.getByText(/no jobs tracked yet/i)).toBeDefined()
	})

	it('renders a list of job applications with title, stage, and status', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.getByText('Stripe')).toBeDefined()
		expect(screen.getByText('Backend Engineer')).toBeDefined()
		expect(screen.getByText(/Stage: Applied/i)).toBeDefined()
		expect(screen.getByText(/Status: Active/i)).toBeDefined()

		expect(screen.getByText('Linear')).toBeDefined()
		expect(screen.getByText('Frontend Engineer')).toBeDefined()
		expect(screen.getByText(/Stage: Interview 1/i)).toBeDefined()
		expect(screen.getByText(/Status: Interviewing/i)).toBeDefined()
	})

	it('renders optional metadata such as notes and posting link when provided', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.getByText(/referred by engineering director/i)).toBeDefined()
		const link = screen.getByRole('link', { name: /view posting/i })
		expect(link.getAttribute('href')).toBe('https://stripe.com/jobs/1')
	})

	it('calls onEdit with the corresponding job when Edit is clicked', async () => {
		const user = userEvent.setup()
		const handleEdit = vi.fn()

		render(<JobList jobs={mockJobs} onEdit={handleEdit} />)

		const editButtons = screen.getAllByRole('button', { name: /edit/i })
		await user.click(editButtons[0])

		expect(handleEdit).toHaveBeenCalledTimes(1)
		expect(handleEdit).toHaveBeenCalledWith(mockJobs[0])
	})

	it('calls onDelete with the corresponding job when Delete is clicked', async () => {
		const user = userEvent.setup()
		const handleDelete = vi.fn()

		render(<JobList jobs={mockJobs} onDelete={handleDelete} />)

		const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
		await user.click(deleteButtons[0])

		expect(handleDelete).toHaveBeenCalledTimes(1)
		expect(handleDelete).toHaveBeenCalledWith(mockJobs[0])
	})

	it('does not render edit or delete buttons when callbacks are omitted', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.queryByRole('button', { name: /edit/i })).toBeNull()
		expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
	})
})