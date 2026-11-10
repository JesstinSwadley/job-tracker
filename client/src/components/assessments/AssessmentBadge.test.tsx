import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AssessmentBadge from './AssessmentBadge'

describe('AssessmentBadge', () => {
	it('renders the total score and recommendation tier', () => {
		render(
			<AssessmentBadge
				totalScore={88}
				recommendation="Apply - Priority"
			/>
		)

		expect(screen.getByText(/88 \/ 100/)).toBeDefined()
		expect(screen.getByText(/apply - priority/i)).toBeDefined()
	})

	it('triggers onClick when clicked if provided', () => {
		const handleClick = vi.fn()
		render(
			<AssessmentBadge
				totalScore={62}
				recommendation="Apply - Stretch"
				onClick={handleClick}
			/>
		)

		const badge = screen.getByRole('button')
		fireEvent.click(badge)

		expect(handleClick).toHaveBeenCalledTimes(1)
	})
})