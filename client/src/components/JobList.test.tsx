import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JobList, { type Job } from "./JobList";

describe('JobList', () => {
	it('renders an empty state when no jobs are present', () => {
		render(<JobList jobs={[]} />)

		expect(screen.getByText(/no jobs tracked yet/i)).toBeDefined()
	})

	it('renders a list of job applications', () => {
		const mockJobs: Job[] =[
			{ id: 1, company: 'Stripe', position: 'Backend Engineer', status: 'Applied' },
			{ id: 2, company: 'Linear', position: 'Frontend Engineer', status: 'Interviewing' },
		]

		render(<JobList jobs={mockJobs} />)

		expect(screen.getByText('Stripe')).toBeDefined()
		expect(screen.getByText('Backend Engineer')).toBeDefined()
		expect(screen.getByText('Linear')).toBeDefined()
    	expect(screen.getByText('Frontend Engineer')).toBeDefined()
	})
})