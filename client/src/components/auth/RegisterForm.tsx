import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { registerRequest } from '../../services/auth';
import { registerSchema, type RegisterFormData } from '../../schemas/registerSchema';
import Input from '../ui/Input';
import Button from '../ui/Button';


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
								to="/login"
								className="text-sm font-bold text-gray-300">
									Already have an account? Login Here
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

					<Input
						type="password"
						label="Confirm Password"
						id="confirmPassword"
						name="confirmPassword"
						placeholder="Confirm Password"
						error={fieldErrors.confirmPassword?.[0]} />

					<button
						type="submit"
						disabled={isLoading}
						className={`w-40 rounded-lg py-3 text-lg font-bold text-white transition cursor-pointer ${
							isLoading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
						}`}>
							{isLoading ? "Creating Account..." : "Register"}
					</button>

					<Button
						type="submit"
						isLoading={isLoading}
						className="w-40">
							Register
					</Button>
			</form>
		</>
	);
}

export default RegisterForm;