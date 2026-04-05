import Nav from "./components/Nav";
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

function App() {
	return (
		<>
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 3000,
					style: {
						background: '#333',
						color: '#fff',
					},
				}}
			/>

			<BrowserRouter>
				<Nav />

				<main>
					<AppRoutes />
				</main>
			</BrowserRouter>
		</>
	)
}

export default App