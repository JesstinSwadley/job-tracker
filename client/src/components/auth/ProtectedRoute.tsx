import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div
				className="flex h-screen w-full items-center justify-center bg-stone-50">
					<div
						className="flex flex-col items-center gap-4">
							<div 
								className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-100">
							</div>
							<p
								className="text-sm font-bold text-stone-400 uppercase tracking-widest">
									Authenticating
							</p>
					</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to={"/login"} replace />;
	}

	return <Outlet />
}

export default ProtectedRoute;