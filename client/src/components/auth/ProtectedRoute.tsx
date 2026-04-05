import { Navigate, Outlet, useLocation } from "react-router";

const ProtectedRoute = () => {
	const token = localStorage.getItem('token');
	const location = useLocation();

	if (!token) {
		return <Navigate to={"/login"} replace />;
	}

	return <Outlet />
}

export default ProtectedRoute;