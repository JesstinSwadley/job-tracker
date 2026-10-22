import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import CreateJobForm from './CreateJobForm'

describe('CreateJobForm', () => {
	it('submits company and position entered by the user', async () => {
		const user = userEvent.setup()
		const handleSubmit = vi.fn()

		render(<CreateJobForm onSubmit={handleSubmit} />)

		const companyInput = screen.getByLabelText(/company/i)
		const positionInput = screen.getByLabelText(/position/i)
		const submitButton = screen.getByRole('button', { name: /add job/i})

		await user.type(companyInput, 'Stripe')
		await user.type(positionInput, 'Backend Engineer')
		await user.click(submitButton)

		expect(handleSubmit).toHaveBeenCalledOnce()
		expect(handleSubmit).toHaveBeenCalledWith({
			company: 'Stripe',
			position: 'Backend Engineer',
			status: 'Applied'
		})
	})
})