import '@testing-library/jest-dom/vitest';
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import * as jobService from '../services/jobs';
import { renderWithProviders } from "./test-utils";
import Dashboard from "../pages/dashboard/Dashboard";
import { screen, waitFor } from "@testing-library/react";

vi.mock('../services/jobs', () => ({
	fetchJobs: vi.fn(),
	createJob: vi.fn(),
	updateJob: vi.fn(),
}));

describe('Dashboard Core Feature Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	describe('Create Lifecycle', () => {
		test('should guide user through full creation pipeline, hit API, and update the layout grid', async () => {
			const user = userEvent.setup();

			vi.mocked(jobService.fetchJobs).mockResolvedValueOnce([]);

			vi.mocked(jobService.createJob).mockResolvedValue({
				user_id: 123,
				id: 456,
				position: 'Staff Frontend Engineer',
				company: 'Stripe',
				status: 'Applied',
				location_type: 'Remote',
				salary: '$100,000',
				source: 'LinkedIn',
			});

			vi.mocked(jobService.fetchJobs).mockResolvedValue([
				{
					user_id: 123,
					id: 456,
					position: 'Staff Frontend Engineer',
					company: 'Stripe',
					status: 'Applied',
					location_type: 'Remote',
					salary: '$100,000',
					source: 'LinkedIn',
				}
			]);

			renderWithProviders(<Dashboard />, '/dashboard');

			expect(await screen.findByText(/ready to find your dream job/i)).toBeInTheDocument();
			expect(screen.getByText(/your tracker is empty/i)).toBeInTheDocument();

			const addNewButton = screen.getByRole('button', { name: /\+ Add New Job/i });
			await user.click(addNewButton);

			expect(screen.getByText('Track New Application')).toBeInTheDocument();

			await user.type(screen.getByLabelText(/position \*/i), 'Staff Frontend Engineer');
			await user.type(screen.getByLabelText(/company \*/i), 'Stripe');
			await user.type(screen.getByLabelText(/salary/i), '$180,000');
			await user.type(screen.getByLabelText(/source/i), 'LinkedIn');

			const submitButton = screen.getByRole('button', { name: /Add Job/i });
			await user.click(submitButton);

			expect(jobService.createJob).toHaveBeenCalledWith({
				position: 'Staff Frontend Engineer',
				company: 'Stripe',
				status: 'Applied',      
				location_type: 'Remote',
				salary: '$180,000',
				source: 'LinkedIn',
				job_url: '',
				notes: ''
			});

			expect(await screen.findByText(/staff frontend engineer at stripe has been created/i)).toBeInTheDocument();

			await waitFor(() => {
				expect(screen.queryByText('Track New Application')).not.toBeInTheDocument();
			});

			expect(screen.queryByText(/your tracker is empty/i)).not.toBeInTheDocument();
			expect(screen.getByText('Staff Frontend Engineer')).toBeInTheDocument();
			expect(screen.getByText('Stripe')).toBeInTheDocument();
			expect(screen.getByText('Tracking 1 active opportunities')).toBeInTheDocument();
		});
	});
	
	describe('Update Lifecycle', () => {
		test('should open form with pre-filled values, send modified payload to API, and refresh the dashboard grid', async () => {
			const user = userEvent.setup();
			const mockJobId = 999;

			const baseJob = {
				user_id: 123,
				id: mockJobId,
				position: 'React Developer',
				company: 'Netflix',
				status: 'Applied',
				location_type: 'Remote',
				salary: '$120,000',
				source: 'Google',
			};

			const updatedJob = {
				...baseJob,
				position: 'Senior React Developer',
				salary: '$150,000'
			};

			vi.mocked(jobService.fetchJobs).mockResolvedValueOnce([baseJob]);

			vi.mocked(jobService.updateJob).mockResolvedValue(updatedJob);

			vi.mocked(jobService.fetchJobs).mockResolvedValueOnce([updatedJob]);

			renderWithProviders(<Dashboard />, '/dashboard');

			expect(await screen.findByText('React Developer')).toBeInTheDocument();
			expect(screen.getByText('Netflix')).toBeInTheDocument();

			const editButton = screen.getByRole('button', {
				name: /edit/i
			});
			await user.click(editButton);

			expect(screen.getByText('Edit Application')).toBeInTheDocument();

			const positionInput = screen.getByLabelText(/position \*/i);
			const salaryInput = screen.getByLabelText(/salary/i);
			expect(positionInput).toHaveValue('React Developer');
			expect(salaryInput).toHaveValue('$120,000');

			await user.clear(positionInput);
			await user.type(positionInput, 'Senior React Developer');

			await user.clear(salaryInput);
			await user.type(salaryInput, '$150,000');

			const saveButton = screen.getByRole('button', {
				name: /update job/i
			});
			await user.click(saveButton);

			expect(jobService.updateJob).toHaveBeenCalledWith(mockJobId, {
				position: 'Senior React Developer',
				company: 'Netflix',
				status: 'Applied',
				location_type: 'Remote',
				salary: '$150,000',
				source: 'Google',
				job_url: '',
				notes: '',
			});

			expect(await screen.findByText(/senior react developer at netflix has been updated/i)).toBeInTheDocument();

			await waitFor(() => {
				expect(screen.queryByText('Edit Application')).not.toBeInTheDocument();
			});

			expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
			expect(screen.getByText('$150,000')).toBeInTheDocument();
			expect(screen.queryByText('React Developer')).not.toBeInTheDocument();
		});
	});
});