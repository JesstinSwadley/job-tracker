import { Link, useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext";

const Nav = () => {
	const navigate = useNavigate();
	
	const { isAuthenticated, user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<nav 
			className="flex flex-row h-24 justify-between items-center bg-stone-100 px-12 border-b border-stone-200">
				<div 
					className="flex items-center gap-2">
						<span
							className="text-xl font-black text-blue-600 tracking-tighter">
								JOBTRACKER
						</span>
				</div>

				<div
					className="flex items-center gap-2">
						<Link
							to="/"
							className="text-xl font-black text-blue-600 tracking-tighter hover:opacity-80 transition">
								JOBTRACKER
						</Link>
				</div>

				<div 
					className="flex items-center gap-6">
						{isAuthenticated ? (
							<div
								className="flex items-center gap-6">
									<div
										className="hidden md:flex flex-col items-end">
											<span
												className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
													Singed in as
											</span>
											<span
												className="text-sm font-bold text-black">
													{user?.username}
											</span>
									</div>

									<button
										onClick={handleLogout}
										className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition hover:bg-red-600 active:scale-95 cursor-pointer">
											Logout
									</button>
							</div>
						) : (
							<div
								className="flex items-center gap-4">
									<Link
										to="/register"
										className="text-sm font-bold text-stone-500 hover:text-blue-600 transition">
											Register
									</Link>

									<Link
										to="/login"
										className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition hover:bg-blue-700 active:scale-95">
											Login
									</Link>
							</div>
						)}
				</div>
		</nav>
	)
}

export default Nav