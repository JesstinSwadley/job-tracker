import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { loginRequest } from '../../services/auth';
import toast from 'react-hot-toast';

const LoginForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData: FormData = new FormData(e.currentTarget);
		const username = formData.get("username") as string;
		const password = formData.get("password") as string;

		try {
			const data = await loginRequest(username, password);

			localStorage.setItem('token', data.token);

			toast.success(`Welcome back, ${data.username}`, {
				className: 'bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow-blue-200 shadow-2xl'
			});
			
			navigate('/dashboard');
		} catch (err: any) {
			setError(err.message);

			toast.error(err.message || "Login failed");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<form 
				onSubmit={handleSubmit}
				className="space-y-6">
					<div
						className="space-y-1">
							<h2 className="text-xl font-bold text-black">Login</h2>

							{error && <p className="text-red-500 text-sm font-bold">{error}</p>}

							<Link
								className="text-sm font-bold text-gray-300"
								to="/register">
									Need to register an account? Create an account
							</Link>
					</div>
				
				<div
					className="space-y-1">
					<label 
						className="text-sm font-bold text-black"
						htmlFor="username">
							Username
					</label>
					<input 
						type="text" 
						name="username" 
						id="username"
						placeholder='Username'
						className="w-full rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
				</div>

				<div
					className="space-y-1">
					<label 
						htmlFor="password"
						className="text-sm font-bold text-black">
							Password
					</label>
					<input 
						type="password" 
						name="password" 
						id="password"
						placeholder='Password'
						className="w-full rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
				</div>

				<div
					className="flex items-center gap-2">
					<input 
						type="checkbox" 
						name="remember" 
						id="remember" 
						className="h-5 w-5 rounded border-gray-200" />
					<label 
						htmlFor="remember"
						className="text-sm font-bold text-black" >
							Keep me logged in?
					</label>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className={`w-40 rounded-lg py-3 text-lg font-bold text-white transition cursor-pointer ${
						isLoading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
					}`}
				>
					{isLoading ? "Signing in..." : "Login"}
				</button>


				<div
					className="flex justify-between text-sm font-bold text-gray-300">
					<Link
						className="hover:underline"
						to="#">
							Forgot Username?
					</Link>
					
					<Link
						className="hover:underline"
						to="#">
							Forgot Password?
					</Link>
				</div>
			</form>
		</>
	)
}

export default LoginForm