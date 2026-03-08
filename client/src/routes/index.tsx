import { Routes, Route, Navigate } from "react-router";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";

const AppRoutes = () => {
	return (
		<Routes>
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
						Component={Dashboard} />
					
					<Route 
						path="/jobs" 
						element={<div>Job List Page</div>} />
			</Route>

			<Route 
				path="/" 
				element={<Navigate to="/dashboard" replace />} />

			<Route 
				path="*" 
				element={<div className="p-10 text-center">404 - Page Not Found</div>} />
		</Routes>
	);
};

export default AppRoutes;