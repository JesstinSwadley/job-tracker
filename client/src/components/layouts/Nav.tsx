import { Link, useNavigate } from "react-router"
import { useAuth } from "../../context/AuthContext";
import { LogOut, User } from "lucide-react";
import Button from "../ui/Button";

const Nav = () => {
	const navigate = useNavigate();
	
	const { isAuthenticated, user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<nav 
			className="flex flex-row h-24 justify-between items-center bg-stone-100 border-b border-stone-200 px-8 md:px-12">
				<Link
					to={isAuthenticated ? "/dahsboard" : "/"}
					className="flex items-center gap-2 transition hover:opacity-80">
						<span
							className="text-xl font-black tracking-tighter text-blue-600">
								JOBTRACKER
						</span>
				</Link>

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
											<div
												className="flex items-center gap-2">
												<span
													className="text-sm font-bold text-black">
														{user?.username}
												</span>

												<User
													size={14}
													className="text-stone-400" />
											</div>
									</div>


									<Button
										variant="danger"
										size="sm"
										icon={LogOut}
										onClick={handleLogout}
										className="h-10">
											Logout
									</Button>
							</div>
						) : (
							<div
								className="flex items-center gap-4">
									<Link
										to="/register"
										className="text-sm font-bold text-stone-500 hover:text-blue-600 transition">
											Register
									</Link>

								<Button
									onClick={() => navigate('/login')}
									size="sm"
									className="h-10">
										Login
								</Button>
							</div>
						)}
				</div>
		</nav>
	);
}

export default Nav;