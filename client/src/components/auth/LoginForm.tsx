import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { loginRequest } from '../../services/auth';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '../../schemas/loginSchema';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

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
							<h2
								className="text-xl font-bold text-black">
									Login
							</h2>
							
							<Link
								to="/register"
								className="text-sm font-bold text-gray-300">
									Need to register an account? Create an account
							</Link>
					</div>

					<Input
						type="text"
						label="Username"
						id="username"
						name="username"
						placeholder="Username"
						error={fieldErrors.username?.[0]} />

					<Input
						type="password"
						label="Password"
						id="password"
						name="password"
						placeholder="Password"
						error={fieldErrors.password?.[0]} />

					<div
						className="flex items-center gap-2">
							<input 
								type="checkbox"
								name="remember"
								id="remember"
								className="h-5 w-5 rounded border-gray-200 cursor-pointer" />

							<label 
								htmlFor="remember"
								className="text-sm font-bold text-black cursor-pointer">
									Keep me logged in?
							</label>
					</div>

					<Button
						type="submit"
						isLoading={isLoading}
						className="w-40">
							Login
					</Button>

					<div
						className="flex justify-between text-sm font-bold text-gray-300">
							<Link
								to="#"
								className="hover:underline hover:text-blue-500 transition">
									Forgot Username?
							</Link>
							<Link
								to="#"
								className="hover:underline hover:text-blue-500 transition">
									Forgot Password?
							</Link>
					</div>
			</form>
		</>
	);
}

export default LoginForm;