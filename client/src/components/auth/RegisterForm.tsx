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

			toast.success(`Welcome to JobTracker, ${data.username}`);

			navigate('/dashboard');
		} catch (err: any) {
			toast.error(err.message || "Registration failed");

			if (err.message?.toLowerCase().includes("username")) {
				setFieldErrors(prev => ({
					...prev,
					username: [err.message]
				}));
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
								className="text-2xl font-black text-ui-text tracking-tight uppercase">
									Register
							</h2>
							
							<Link
								to="/login"
								className="text-sm font-bold text-ui-muted hover:text-brand transition-colors flex items-center gap-1">
									Already have an account?

									<span 
										className="text-brand underline">
											Login Here
									</span>
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

					<Button
						type="submit"
						isLoading={isLoading}
						className="w-full md:w-40">
							Register
					</Button>
			</form>
		</>
	);
}

export default RegisterForm;