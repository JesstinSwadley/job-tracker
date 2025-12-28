
import Nav from "./components/Nav";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {

	
	return (
		<>
			<BrowserRouter>
				<Nav />

				<main>
					<Routes>
						<Route 
							path="/"
							Component={Home} />
						
						<Route
							path="/login"
							Component={Login} />
					</Routes>
				</main>
			</BrowserRouter>
		</>
	)
}

export default App
