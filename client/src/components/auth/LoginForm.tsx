import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { loginRequest } from '../../services/auth';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '../../schemas/loginSchema';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string[]>>>({});
	
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setFieldErrors({});

		const formData = new FormData(e.currentTarget);
		const rawData = Object.fromEntries(formData.entries());

		const result = loginSchema.safeParse(rawData);

		if (!result.success) {
			const errors: Partial<Record<keyof LoginFormData, string[]>> = {};

			result.error.issues.forEach((issue) => {
				const key = issue.path[0] as keyof LoginFormData;

				if (!errors[key]) errors[key] = [];
				
				errors[key]?.push(issue.message);
			});

			setFieldErrors(errors);
			setIsLoading(false);
			return;
		}

		try {
			const data = await loginRequest(result.data.username, result.data.password);

			login(data);

			toast.success(`Welcome back, ${data.username}`, {
				className: 'bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow-blue-200 shadow-2xl'
			});
			
			navigate('/dashboard');
		} catch (err: any) {
			toast.error(err.message || "Invalid username or password");

			setFieldErrors({
				username: [],
				password: []
			});
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
							className={`w-full rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								fieldErrors.username ? "border-red-500" : "border-gray-200"
							}`} />

						{fieldErrors.username?.[0] && (
							<p
								className="text-xs font-bold text-red-500 transition-opacity duration-300 ease-in opacity-100">
									{fieldErrors.username[0]}
							</p>
						)}
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
							className={`w-full rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								fieldErrors.password ? "border-red-500" : "border-gray-200"
							}`} />
						
						{fieldErrors.password?.[0] && (
							<p
								className="text-xs font-bold text-red-500 transition-opacity duration-300 ease-in opacity-100">
									{fieldErrors.password[0]}
							</p>
						)}
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
							className="hover:underline hover:text-blue-500 transition"
							to="#">
								Forgot Username?
						</Link>
						
						<Link
							className="hover:underline hover:text-blue-500 transition"
							to="#">
								Forgot Password?
						</Link>
				</div>
			</form>
		</>
	)
}

export default LoginForm