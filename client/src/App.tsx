import Nav from "./components/Nav";
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes";

function App() {
	return (
		<>
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