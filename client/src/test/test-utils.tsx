import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export function renderWithProviders(ui: React.ReactElement, initialRoute = '/') {
	return render(
		<ThemeProvider>
			<AuthProvider>
				<Toaster />
				<MemoryRouter initialEntries={[initialRoute]}>
					{ui}
				</MemoryRouter>
			</AuthProvider>
		</ThemeProvider>
	);
}