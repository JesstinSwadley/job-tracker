import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { registerRequest } from '../../services/auth';
import { registerSchema, type RegisterFormData } from '../../schemas/registerSchema';


const RegisterForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string[]>>>({});

	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setFieldErrors({});

		const formData: FormData = new FormData(e.currentTarget);
		const rawData = Object.fromEntries(formData.entries());

		const result = registerSchema.safeParse(rawData);

		if (!result.success) {
			const errors: Partial<Record<keyof RegisterFormData, string[]>> = {};

			result.error.issues.forEach((issue) => {
				const fieldName = issue.path[0] as keyof RegisterFormData;

				if (!errors[fieldName]) {
					errors[fieldName] = [];
				}

				errors[fieldName]?.push(issue.message);
			});

			setFieldErrors(errors);
			setIsLoading(false);
			toast.error("Please fix the registration errors.");
			return;
		}

		try {
			const data = await registerRequest(result.data.username, result.data.password);

			login({ token: data.token, username: data.username});

			toast.success(`Welcome, ${data.username}`, {
				className: 'bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow-blue-200 shadow-2xl'
			});

			navigate('/dashboard');
		} catch (err: any) {
			toast.error(err.message || "Registration failed");

			if (err.message?.toLowerCase().includes("username")) {
				setFieldErrors({
					username: [err.message]
				});
			}
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

							<Link
								className="text-sm font-bold text-gray-300"
								to="/login">
									Already have an account? Login Here
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
							}`} 
						/>

						{fieldErrors.username && (
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
							title="Must be at least 8 characters"
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
							}`} 
						/>

						{fieldErrors.password?.[0] && (
							<p
								className="text-xs font-bold text-red-500 transition-opacity duration-300 ease-in opacity-100">
									{fieldErrors.password[0]}
							</p>
						)}
					</div>

					<div
						className="space-y-1">
						<label 
							htmlFor="confirmPassword"
							className="text-sm font-bold text-black">
								Confirm Password
						</label>
						<input 
							type="password" 
							name="confirmPassword" 
							id="confirmPassword"
							placeholder='Confirm Password'
							className={`w-full rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								fieldErrors.confirmPassword ? "border-red-500" : "border-gray-200"
							}`} 
						/>

						{fieldErrors.confirmPassword?.[0] && (
							<p
								className="text-xs font-bold text-red-500 transition-opacity duration-300 ease-in opacity-100">
									{fieldErrors.confirmPassword[0]}
							</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className={`w-40 rounded-lg py-3 text-lg font-bold text-white transition cursor-pointer ${
							isLoading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
						}`}
					>
						{isLoading ? "Creating Account..." : "Register"}
					</button>
			</form>
		</>
	)
}

export default RegisterForm