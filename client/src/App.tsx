import Nav from "./components/layouts/Nav";
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

function App() {
	return (
		<>
			<AuthProvider>
				<Toaster
					position="top-right"
					toastOptions={{
						duration: 3000,
						className: 'antialiased font-semibold text-sm px-6 py-4 shadow-2xl rounded-brand border border-ui-brand bg-ui-card text-ui-text',
						success: {
							className: 'border-l-4 border-emerald-500 bg-ui-card'
						},
						error: {
							className: 'border-l-4 border-red-500 bg-ui-card'
						}
					}}
				/>

				<BrowserRouter>
					<Nav />

					<div
						className="min-h-screen flex flex-col bg-ui-bg transition-colors duration-300">
							<main
								className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
									<AppRoutes />
							</main>
					</div>
				</BrowserRouter>
			</AuthProvider>
		</>
	)
}

export default App