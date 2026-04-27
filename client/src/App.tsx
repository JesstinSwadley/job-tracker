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
						className: 'antialiased font-semibold text-sm px-6 py-4 shadow-2xl rounded-xl border border-gray-100 bg-white text-gray-800',
						success: {
							className: 'border-l-4 border-green-500'
						},
						error: {
							className: 'border-l-4 border-red-500'
						}
					}}
				/>

				<BrowserRouter>
					<Nav />

					<main>
						<AppRoutes />
					</main>
				</BrowserRouter>
			</AuthProvider>
		</>
	)
}

export default App