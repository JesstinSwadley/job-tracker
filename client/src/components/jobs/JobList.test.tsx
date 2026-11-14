import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Job } from '../../types'
import JobList from './JobList'

describe('JobList', () => {
	const mockJobs: Job[] = [
		{
			id: 1,
			company: 'Stripe',
			title: 'Backend Engineer',
			location: 'San Francisco, CA',
			work_arrangement: 'Remote',
			source: 'Referral',
			application_platform: 'Greenhouse',
			url: 'https://stripe.com/jobs/1',
			stage: 'Assessment',
			interview_round: 0,
			status: 'Active',
			date_posted: '2026-11-01',
			date_found: '2026-11-02',
			date_assessed: '2026-11-03',
			date_applied: '',
			resume_url: 'https://docs.google.com/document/d/resume-1',
			cover_letter_url: 'https://docs.google.com/document/d/cl-1',
			notes: 'Referred by engineering director',
			assessment_total_score: 92,
			assessment_recommendation: 'Apply - Priority',
			notes_count: 3,
		},
		{
			id: 2,
			company: 'Linear',
			title: 'Frontend Engineer',
			location: 'Remote',
			work_arrangement: 'Remote',
			source: 'LinkedIn',
			application_platform: '',
			url: '',
			stage: 'Interviewing',
			interview_round: 2,
			status: 'Active',
			date_posted: '',
			date_found: '2026-11-05',
			date_assessed: '',
			date_applied: '2026-11-06',
			resume_url: '',
			cover_letter_url: '',
			notes: '',
			assessment_total_score: null,
			assessment_recommendation: '',
			notes_count: 0,
		},
	]

	it('renders an empty state when no jobs are present', () => {
		render(<JobList jobs={[]} />)
		expect(screen.getByText(/no jobs tracked yet/i)).toBeDefined()
	})

	it('renders a list of job applications with title, stage, interview round, status, and assessment badge', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.getByText('Stripe')).toBeDefined()
		expect(screen.getByText('Backend Engineer')).toBeDefined()
		expect(screen.getByText(/stage: assessment/i)).toBeDefined()
		expect(screen.getByText(/92 \/ 100/)).toBeDefined()
		expect(screen.getByText(/apply - priority/i)).toBeDefined()

		expect(screen.getByText('Linear')).toBeDefined()
		expect(screen.getByText('Frontend Engineer')).toBeDefined()
		expect(screen.getByText(/stage: interviewing \(round 2\)/i)).toBeDefined()
	})

	it('renders sourcing, lifecycle dates, document links, and summary notes when provided', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.getByText(/source: referral/i)).toBeDefined()
		expect(screen.getByText(/via: greenhouse/i)).toBeDefined()
		expect(screen.getByText(/2026-11-01/)).toBeDefined()
		expect(screen.getByText(/2026-11-06/)).toBeDefined()
		expect(screen.getByText(/referred by engineering director/i)).toBeDefined()

		const postingLink = screen.getByRole('link', { name: /view posting/i })
		expect(postingLink.getAttribute('href')).toBe('https://stripe.com/jobs/1')

		const resumeLink = screen.getByRole('link', { name: /resume/i })
		expect(resumeLink.getAttribute('href')).toBe('https://docs.google.com/document/d/resume-1')

		const coverLetterLink = screen.getByRole('link', { name: /cover letter/i })
		expect(coverLetterLink.getAttribute('href')).toBe('https://docs.google.com/document/d/cl-1')
	})

	it('renders Notes button with count and calls onOpenNotes when clicked', () => {
		const handleOpenNotes = vi.fn()
		render(<JobList jobs={mockJobs} onOpenNotes={handleOpenNotes} />)

		const notesWithCountBtn = screen.getByRole('button', { name: /^notes \(3\)$/i })
		const emptyNotesBtn = screen.getByRole('button', { name: /^notes$/i })

		fireEvent.click(notesWithCountBtn)
		expect(handleOpenNotes).toHaveBeenCalledWith(mockJobs[0])

		fireEvent.click(emptyNotesBtn)
		expect(handleOpenNotes).toHaveBeenCalledWith(mockJobs[1])
	})

	it('calls onAssess with the target job when clicking Assess or Re-assess', () => {
		const handleAssess = vi.fn()
		render(<JobList jobs={mockJobs} onAssess={handleAssess} />)

		const reassessBtn = screen.getByRole('button', { name: /re-assess/i })
		const assessBtn = screen.getByRole('button', { name: /^assess$/i })

		fireEvent.click(reassessBtn)
		expect(handleAssess).toHaveBeenCalledWith(mockJobs[0])

		fireEvent.click(assessBtn)
		expect(handleAssess).toHaveBeenCalledWith(mockJobs[1])
	})

	it('calls onEdit with the corresponding job when Edit is clicked', () => {
		const handleEdit = vi.fn()
		render(<JobList jobs={mockJobs} onEdit={handleEdit} />)

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

	it('does not render action buttons when callbacks are omitted', () => {
		render(<JobList jobs={mockJobs} />)

		expect(screen.queryByRole('button', { name: /notes/i })).toBeNull()
		expect(screen.queryByRole('button', { name: /edit/i })).toBeNull()
		expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
		expect(screen.queryByRole('button', { name: /assess/i })).toBeNull()
	})
})