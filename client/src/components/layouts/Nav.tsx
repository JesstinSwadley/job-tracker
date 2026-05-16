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
			className="flex flex-row h-16 md:h-20 justify-between items-center bg-ui-card border-b border-ui-border px-4 md:px-8 sticky top-0 z-40">
				<Link
					to={isAuthenticated ? "/dashboard" : "/"}
					className="flex items-center gap-2 transition hover:opacity-80">
						<span
							className="text-lg md:text-xl font-black tracking-tighter text-brand">
								JOBTRACKER
						</span>
				</Link>

				<div 
					className="flex items-center gap-4 md:gap-6">
						{isAuthenticated ? (
							<div
								className="flex items-center gap-4 md:gap-6">
									<div
										className="hidden sm:flex flex-col items-end">
											<span
												className="text-[10px] font-black text-ui-muted uppercase tracking-widest">
													Signed in as
											</span>
											<div
												className="flex items-center gap-2">
												<span
													className="text-sm font-bold text-ui-text">
														{user?.username}
												</span>

												<User
													size={14}
													className="text-ui-muted" />
											</div>
									</div>


									<Button
										variant="danger"
										size="sm"
										icon={LogOut}
										onClick={handleLogout}
										className="h-9 md:h-10">
											Logout
									</Button>
							</div>
						) : (
							<div
								className="flex items-center gap-4">
									<Link
										to="/register"
										className="text-sm font-bold text-ui-muted hover:text-brand transition">
											Register
									</Link>

								<Button
									onClick={() => navigate('/login')}
									size="sm"
									className="h-9 md:h-10">
										Login
								</Button>
							</div>
						)}
				</div>
		</nav>
	);
}

export default Nav;