import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import JobList, { type Job } from "./JobList";

describe('JobList', () => {
	const mockJobs: Job[] =[
		{ id: 1, company: 'Stripe', position: 'Backend Engineer', status: 'Applied' },
		{ id: 2, company: 'Linear', position: 'Frontend Engineer', status: 'Interviewing' },
	]

	it('renders an empty state when no jobs are present', () => {
		render(<JobList jobs={[]} />)

		expect(screen.getByText(/no jobs tracked yet/i)).toBeDefined()
	})

	it('renders a list of job applications', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.getByText('Stripe')).toBeDefined()
		expect(screen.getByText('Backend Engineer')).toBeDefined()
		expect(screen.getByText('Linear')).toBeDefined()
    	expect(screen.getByText('Frontend Engineer')).toBeDefined()
	})

	it('calls onEdit with the coressponding job when Edit is clicked', () => {
		const handleEdit = vi.fn()

		render(<JobList jobs={mockJobs} onEdit={handleEdit}/>)

		const editButtons = screen.getAllByRole('button', { name: /edit/i })
		fireEvent.click(editButtons[0])

		expect(handleEdit).toHaveBeenCalledTimes(1)
		expect(handleEdit).toHaveBeenCalledWith(mockJobs[0])
	})

	it('calls onDelete with the corresponding job when Delete is clicked', () => {
		const handleDelete = vi.fn()

		render(<JobList jobs={mockJobs} onDelete={handleDelete} />)

		const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
		fireEvent.click(deleteButtons[0])

		expect(handleDelete).toHaveBeenCalledTimes(1)
		expect(handleDelete).toHaveBeenCalledWith(mockJobs[0])
	})

	it('does not render edit or delete buttons when callbacks are ommited', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.queryByRole('button', { name: /edit/i })).toBeNull()
		expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
	})
})