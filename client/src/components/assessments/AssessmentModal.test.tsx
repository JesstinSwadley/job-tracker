import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AssessmentModal, { type AssessmentScores } from './AssessmentModal'

describe('AssessmentModal', () => {
	const defaultProps = {
		company: 'Cloudflare',
		jobTitle: 'Systems Engineer',
		onSubmit: vi.fn(),
		onCancel: vi.fn()
	}

	it('renders all 7 rubric scoring inputs with initial values of 0', () => {
		render(<AssessmentModal {...defaultProps} />)

		expect(screen.getByText(/Cloudflare/)).toBeDefined()
		expect(screen.getByText(/Systems Engineer/)).toBeDefined()

		const careerInput = screen.getByLabelText(/career alignment/i) as HTMLInputElement
		const expInput = screen.getByLabelText(/experience match/i) as HTMLInputElement
		const techInput = screen.getByLabelText(/technical alignment/i) as HTMLInputElement
		const compInput = screen.getByLabelText(/compensation/i) as HTMLInputElement
		const workInput = screen.getByLabelText(/work arrangement/i) as HTMLInputElement
		const geoInput = screen.getByLabelText(/geographic alignment/i) as HTMLInputElement
		const growthInput = screen.getByLabelText(/growth value/i) as HTMLInputElement

		expect(careerInput.value).toBe('0')
		expect(expInput.value).toBe('0')
		expect(techInput.value).toBe('0')
		expect(compInput.value).toBe('0')
		expect(workInput.value).toBe('0')
		expect(geoInput.value).toBe('0')
		expect(growthInput.value).toBe('0')
	})

	it('populates fields when initialScores are supplied', () => {
		const initialScores: AssessmentScores = {
			career_alignment: 20,
			experience_match: 15,
			technical_alignment: 12,
			compensation_score: 10,
			work_arrangement_score: 8,
			geographic_alignment: 4,
			growth_value: 8
		}

		render(<AssessmentModal {...defaultProps} initialScores={initialScores} />)

		const careerInput = screen.getByLabelText(/career alignment/i) as HTMLInputElement
		expect(careerInput.value).toBe('20')
		expect(screen.getByText(/total: 77 \/ 100/i)).toBeDefined()
		expect(screen.getByText(/apply - target/i)).toBeDefined()
	})

	it('updates live score total and recommendation tier as inputs change', () => {
		render(<AssessmentModal {...defaultProps} />)

		// Initially 0 -> Do Not Apply
		expect(screen.getByText(/total: 0 \/ 100/i)).toBeDefined()
		expect(screen.getByText(/do not apply/i)).toBeDefined()

		// Give scores to reach Apply - Priority (>= 85)
		fireEvent.change(screen.getByLabelText(/career alignment/i), { target: { value: '25' } })
		fireEvent.change(screen.getByLabelText(/experience match/i), { target: { value: '20' } })
		fireEvent.change(screen.getByLabelText(/technical alignment/i), { target: { value: '15' } })
		fireEvent.change(screen.getByLabelText(/compensation/i), { target: { value: '15' } })
		fireEvent.change(screen.getByLabelText(/growth value/i), { target: { value: '10' } })

		expect(screen.getByText(/total: 85 \/ 100/i)).toBeDefined()
		expect(screen.getByText(/apply - priority/i)).toBeDefined()
	})

	it('submits parsed integer scores matching the backend contract', () => {
		const handleSubmit = vi.fn()
		render(<AssessmentModal {...defaultProps} onSubmit={handleSubmit} />)

		fireEvent.change(screen.getByLabelText(/career alignment/i), { target: { value: '22' } })
		fireEvent.change(screen.getByLabelText(/technical alignment/i), { target: { value: '14' } })

		fireEvent.click(screen.getByRole('button', { name: /save assessment/i }))

		expect(handleSubmit).toHaveBeenCalledTimes(1)
		expect(handleSubmit).toHaveBeenCalledWith({
			career_alignment: 22,
			experience_match: 0,
			technical_alignment: 14,
			compensation_score: 0,
			work_arrangement_score: 0,
			geographic_alignment: 0,
			growth_value: 0
		})
	})

	it('calls onCancel when the cancel button is clicked', () => {
		const handleCancel = vi.fn()
		render(<AssessmentModal {...defaultProps} onCancel={handleCancel} />)

		fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
		expect(handleCancel).toHaveBeenCalledTimes(1)
	})
})