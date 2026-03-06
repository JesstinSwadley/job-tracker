import Nav from "./components/Nav";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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

						<Route
							path="/register"
							Component={Register} />

						<Route 
							element={<ProtectedRoute />}>

							<Route 
								path="/dashboard" 
								element={<div className="p-10 text-2xl font-bold text-center">Your Job Tracker Dashboard</div>} />
						</Route>
					</Routes>
				</main>
			</BrowserRouter>
		</>
	)
}

export default App