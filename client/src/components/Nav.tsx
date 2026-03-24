import { Link, useNavigate } from "react-router"

const Nav = () => {
	const navigate = useNavigate();
	const token = localStorage.getItem('token');

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	}

	return (
		<nav 
			className="flex flex-row h-24 justify-around bg-stone-200 px-8">
			<div 
				className="flex items-center gap-2">
					<span
						className="text-xl font-black text-blue-600 tracking-tighter">
							JOBTRACKER
					</span>
			</div>
			<div className=""></div>
			<div 
				className="flex items-center gap-4">
					{token ? (
						<button
							onClick={handleLogout}
							className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl transition hover:bg-red-600 cursor-pointer">
								Logout
						</button>
					) : (
						<Link 
							className="px-4 py-2 bg-blue-500 text-white rounded-md"
							to="/login">
								Login
						</Link>
					)}
			</div>
		</nav>
	)
}

export default Nav