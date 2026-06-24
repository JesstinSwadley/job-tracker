import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div
				className="flex flex-1 w-full flex-col items-center justify-center bg-ui-bg min-h-[60vh]">
					<div
						className="flex flex-col items-center gap-4">
							<div 
								className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent shadow-xl shadow-brand/10">
							</div>
							<p
								className="text-xs font-black text-ui-muted uppercase tracking-[0.2em] animate-pulse">
									Authenticating
							</p>
					</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate 
					to={"/login"}
					state={{ from: location }} 
					replace />;
	}

	return <Outlet />
}

export default ProtectedRoute;