
import Nav from "./components/Nav";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./pages/Home";

function App() {

	
	return (
		<>
			<BrowserRouter>
				<Nav />

				<main>
					<Routes>
						<Route 
							path="/"
							Component={Home}/>
					</Routes>
				</main>
			</BrowserRouter>
		</>
	)
}

export default App
