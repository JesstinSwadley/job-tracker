import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import * as authServices from '../services/auth';
import { renderWithProviders } from './test-utils';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';


vi.mock('../services/auth', () => ({
	loginRequest: vi.fn(),
	registerRequest: vi.fn(),
}));

describe('Authentication Flow Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	describe('Login Flow', () => {
		test('should prevent submissino and render validation errors on empty fields', async () => {
			const user = userEvent.setup();

			renderWithProviders(<LoginForm />, '/login');

			const submitButton = screen.getByRole('button', { name: /login/i });
			await user.click(submitButton);

			expect(authServices.loginRequest).not.toHaveBeenCalled();
			expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
			expect(screen.getByText(/password is required/i)).toBeInTheDocument();
		});

		test('', async () => {
			const user = userEvent.setup();

			const mockUserPayload = {
				token: 'mock-login-token',
				username: 'test_dev',
			};

			vi.mocked(authServices.loginRequest).mockResolvedValue(mockUserPayload);

			renderWithProviders(<LoginForm />, '/login');

			await user.type(screen.getByLabelText(/username/i), 'test_dev');
			await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
			await user.click(screen.getByRole('button', { name: /login/i }));

			expect(authServices.loginRequest).toHaveBeenCalledWith('test_dev', 'SecurePass123!');

			await waitFor(() => {
				expect(localStorage.getItem('token')).toBe('mock-login-token');
				expect(localStorage.getItem('username')).toBe('test_dev');
			});

			expect(await screen.findByText(/welcome back, test_dev/i)).toBeInTheDocument();
		});
	});

	describe('Registration Flow', () => {
		test('should reject submissions if passwords do not match', async () => {
			const user = userEvent.setup();

			renderWithProviders(<RegisterForm />, '/register');

			await user.type(screen.getByLabelText(/^username/i), 'new_user');
			await user.type(screen.getByLabelText(/^password/i), 'Password123');
			await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword456');
			await user.click(screen.getByRole('button', { name: /register/i }));

			expect(authServices.registerRequest).not.toHaveBeenCalled();
			expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
		});

		test('should invoke registerRequest, automatically sign user in, and fire a welcome toast', async () => {
			const user = userEvent.setup();

			const mockRegisterPayload = {
				token: 'mock-register-token',
				username: 'new_user'
			};

			vi.mocked(authServices.registerRequest).mockResolvedValue(mockRegisterPayload);

			renderWithProviders(<RegisterForm />, '/register');

			await user.type(screen.getByLabelText(/^username/i), 'new_user');
			await user.type(screen.getByLabelText(/^password/i), 'Password123');
			await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
			await user.click(screen.getByRole('button', { name: /register/i }));

			expect(authServices.registerRequest).toHaveBeenCalledWith('new_user', 'Password123');

			await waitFor(() => {
				expect(localStorage.getItem('token')).toBe('mock-register-token');
				expect(localStorage.getItem('username')).toBe('new_user');
			});

			expect(await screen.findByText(/welcome to jobtracker, new_user/i)).toBeInTheDocument();
		});
	});
});