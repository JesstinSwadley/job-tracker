import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Lazy Load Page components
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));

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
		</Suspense>
	);
};

export default AppRoutes;