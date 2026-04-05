import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { registerRequest } from '../../services/auth';
import toast from 'react-hot-toast';

const RegisterForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		const formData: FormData = new FormData(e.currentTarget);
		const username = formData.get("username") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			const data = await registerRequest(username, password);

			localStorage.setItem('token', data.token);

			toast.success(`Welcome back, ${data.username}`);

			navigate('/dashboard');
		} catch (err: any) {
			setError(err.message);

			toast.error(err.message || "Register failed");
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
							<h2 
								className="text-xl font-bold text-black">
									Register
							</h2>

							{error && <p className="text-red-500 text-sm font-bold">{error}</p>}

							<Link
								className="text-sm font-bold text-gray-300"
								to="/login">
									Already have an account?
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
							required
							minLength={3}
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
							required
							minLength={8}
							type="password" 
							name="password" 
							id="password"
							placeholder='Password'
							className="w-full rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
					</div>

					<div
						className="space-y-1">
						<label 
							htmlFor="confirmPassword"
							className="text-sm font-bold text-black">
								Confirm Password
						</label>
						<input 
							required
							minLength={8}
							type="password" 
							name="confirmPassword" 
							id="confirmPassword"
							placeholder='Confirm Password'
							className="w-full rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className={`w-40 rounded-lg py-3 text-lg font-bold text-white transition cursor-pointer ${
							isLoading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
						}`}
					>
						{isLoading ? "Creating Account..." : "Register"}
					</button>
			</form>
		</>
	)
}

export default RegisterForm