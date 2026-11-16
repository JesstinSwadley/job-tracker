import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Job, JobNote } from '../../types'
import * as notesApi from '../../api/notes'
import JobNotesModal from './JobNotesModal'

vi.mock('../../api/notes', () => ({
  fetchJobNotes: vi.fn(),
  createJobNote: vi.fn(),
  updateJobNote: vi.fn(),
  deleteJobNote: vi.fn(),
}))

describe('JobNotesModal', () => {
	const mockJob: Job = {
		id: 10,
		company: 'Stripe',
		title: 'Staff Backend Engineer',
		location: 'Seattle, WA',
		work_arrangement: 'Hybrid',
		source: 'Referral',
		application_platform: 'Greenhouse',
		url: 'https://stripe.com/jobs/10',
		stage: 'Interviewing',
		interview_round: 2,
		status: 'Active',
		date_posted: '2026-11-01',
		date_found: '2026-11-02',
		date_assessed: '2026-11-03',
		date_applied: '2026-11-04',
		resume_url: '',
		cover_letter_url: '',
		notes: '',
		assessment_total_score: 90,
		assessment_recommendation: 'Apply - Priority',
		notes_count: 2,
	}

	const initialNotes: JobNote[] = [
		{
		id: 102,
		job_id: 10,
		section: 'Interview',
		interview_round: 2,
		content: 'System design deep dive on ledger idempotency.',
		created_at: '2026-11-10T18:30:00Z',
		},
		{
		id: 101,
		job_id: 10,
		section: 'Compensation',
		interview_round: 0,
		content: 'Recruiter shared base range of $220k - $250k.',
		created_at: '2026-11-08T14:00:00Z',
		},
	]

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('loads and displays existing notes with section and round badges', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce(initialNotes)

		render(
			<JobNotesModal
				job={mockJob}
				onNotesCountChange={vi.fn()}
				onClose={vi.fn()}/>
		)

		expect(screen.getByText(/Stripe/)).toBeDefined()
		expect(screen.getByText(/Staff Backend Engineer/)).toBeDefined()
		expect(notesApi.fetchJobNotes).toHaveBeenCalledWith(10)

		expect(
			await screen.findByText(/system design deep dive on ledger idempotency\./i)
		).toBeDefined()
		expect(screen.getByText(/recruiter shared base range of \$220k - \$250k\./i)).toBeDefined()
		expect(screen.getByText(/round 2/i)).toBeDefined()
	})

	it('renders an empty state when no notes exist for the job', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce([])

		render(
			<JobNotesModal
				job={{ ...mockJob, notes_count: 0 }}
				onNotesCountChange={vi.fn()}
				onClose={vi.fn()}/>
		)

		expect(await screen.findByText(/no notes logged yet/i)).toBeDefined()
	})

	it('filters displayed notes when clicking section filter tabs', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce(initialNotes)

		render(
			<JobNotesModal
				job={mockJob}
				onNotesCountChange={vi.fn()}
				onClose={vi.fn()}/>
		)

		await screen.findByText(/system design deep dive/i)

		fireEvent.click(screen.getByRole('button', { name: /^compensation$/i }))

		expect(screen.queryByText(/system design deep dive/i)).toBeNull()
		expect(screen.getByText(/recruiter shared base range/i)).toBeDefined()

		fireEvent.click(screen.getByRole('button', { name: /^all$/i }))
		expect(screen.getByText(/system design deep dive/i)).toBeDefined()
	})

	it('creates a new note with conditional interview round and updates notes count', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce(initialNotes)

		const createdNote: JobNote = {
			id: 103,
			job_id: 10,
			section: 'Interview',
			interview_round: 3,
			content: 'Panel debrief with engineering manager.',
			created_at: '2026-11-12T10:00:00Z',
		}

		vi.mocked(notesApi.createJobNote).mockResolvedValueOnce(createdNote)

		const handleCountChange = vi.fn()

		render(
			<JobNotesModal
				job={mockJob}
				onNotesCountChange={handleCountChange}
				onClose={vi.fn()}/>
		)

		await screen.findByText(/system design deep dive/i)

		expect(screen.queryByLabelText(/interview round/i)).toBeNull()

		fireEvent.change(screen.getByLabelText(/section/i), { target: { value: 'Interview' } })
		const roundInput = screen.getByLabelText(/interview round/i) as HTMLInputElement
		expect(roundInput).toBeDefined()
		fireEvent.change(roundInput, { target: { value: '3' } })

		const contentInput = screen.getByLabelText(/note content/i) as HTMLTextAreaElement
		fireEvent.change(contentInput, {
			target: { 
				value: 'Panel debrief with engineering manager.' 
			},
		})

		fireEvent.click(screen.getByRole('button', { name: /add note/i }))

		await waitFor(() => {
			expect(notesApi.createJobNote).toHaveBeenCalledWith(10, {
				section: 'Interview',
				interview_round: 3,
				content: 'Panel debrief with engineering manager.',
			})
		})

		expect(await screen.findByText(/panel debrief with engineering manager\./i)).toBeDefined()
		expect(handleCountChange).toHaveBeenCalledWith(10, 3)
		expect(contentInput.value).toBe('')
	})

	it('does not submit when note content is blank or whitespace only', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce([])

		render(
			<JobNotesModal
				job={mockJob}
				onNotesCountChange={vi.fn()}
				onClose={vi.fn()}/>
		)

		await screen.findByText(/no notes logged yet/i)

		fireEvent.change(screen.getByLabelText(/note content/i), { target: { value: '   ' } })
		fireEvent.click(screen.getByRole('button', { name: /add note/i }))

		expect(notesApi.createJobNote).not.toHaveBeenCalled()
	})

	it('allows inline editing of an existing note', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce(initialNotes)

		const updatedNote: JobNote = {
			...initialNotes[1],
			section: 'Role',
			content: 'Owns core payment settlement pipeline.',
		}

		vi.mocked(notesApi.updateJobNote).mockResolvedValueOnce(updatedNote)

		render(
			<JobNotesModal
				job={mockJob}
				onNotesCountChange={vi.fn()}
				onClose={vi.fn()}/>
		)

		await screen.findByText(/recruiter shared base range/i)

		const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
		fireEvent.click(editButtons[1])

		const editSectionSelect = screen.getByLabelText(/edit section/i)
		const editContentArea = screen.getByLabelText(/edit note content/i)

		fireEvent.change(editSectionSelect, { target: { value: 'Role' } })
		fireEvent.change(editContentArea, {
			target: { value: 'Owns core payment settlement pipeline.' },
		})

		fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

		await waitFor(() => {
			expect(notesApi.updateJobNote).toHaveBeenCalledWith(10, 101, {
				section: 'Role',
				interview_round: 0,
				content: 'Owns core payment settlement pipeline.',
			})
		})

		expect(await screen.findByText(/owns core payment settlement pipeline\./i)).toBeDefined()
	})

	it('deletes a note and notifies parent of updated notes count', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce(initialNotes)
		vi.mocked(notesApi.deleteJobNote).mockResolvedValueOnce(undefined)

		const handleCountChange = vi.fn()

		render(
			<JobNotesModal
				job={mockJob}
				onNotesCountChange={handleCountChange}
				onClose={vi.fn()}
			/>
		)

		await screen.findByText(/system design deep dive/i)

		const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i })
		fireEvent.click(deleteButtons[0])

		await waitFor(() => {
			expect(notesApi.deleteJobNote).toHaveBeenCalledWith(10, 102)
		})

		expect(screen.queryByText(/system design deep dive/i)).toBeNull()
		expect(handleCountChange).toHaveBeenCalledWith(10, 1)
	})

	it('displays an error message when fetching notes fails', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockRejectedValueOnce(new Error('Failed to load notes'))

		render(
			<JobNotesModal
				job={mockJob}
				onNotesCountChange={vi.fn()}
				onClose={vi.fn()}/>
		)

		expect(await screen.findByText(/failed to load notes/i)).toBeDefined()
	})

	it('calls onClose when the close button is clicked', async () => {
		vi.mocked(notesApi.fetchJobNotes).mockResolvedValueOnce([])
		const handleClose = vi.fn()

		render(
		<JobNotesModal
			job={mockJob}
			onNotesCountChange={vi.fn()}
			onClose={handleClose}
		/>
		)

		await screen.findByText(/no notes logged yet/i)

		fireEvent.click(screen.getByRole('button', { name: /^close$/i }))
		expect(handleClose).toHaveBeenCalledTimes(1)
	})
})