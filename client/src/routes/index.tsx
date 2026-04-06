import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Lazy Load Page components
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const NotFound = lazy(() => import("../pages/NotFound"));

const PageLoader = () => (
	<div 
		className="flex h-64 w-full items-center justify-center">
		<div 
			className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
	</div>
)

const AppRoutes = () => {
	return (
		<Suspense 
			fallback={< PageLoader />}>
				<Routes>
					<Route 
						path="/login" 
						element={<Login />} />
					<Route 
						path="/register" 
						element={<Register />} />

					<Route 
						element={<ProtectedRoute />}>
							<Route 
								path="/dashboard" 
								element={<Dashboard />} />
							
							<Route 
								path="/jobs" 
								element={<div>Job List Page</div>} />
					</Route>

					<Route 
						path="/" 
						element={<Navigate to="/dashboard" replace />} />

					<Route 
						path="*" 
						element={<NotFound />} />
				</Routes>
		</Suspense>
	);
};

export default AppRoutes;