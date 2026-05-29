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

			toast.success(`Welcome back, ${data.username}`);
			
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
								className="text-2xl font-black text-ui-text tracking-tight uppercase">
									Login
							</h2>
							
							<Link
								to="/register"
								className="text-sm font-bold text-ui-muted hover:text-brand transition-colors">
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
								className="h-5 w-5 rounded border-ui-border bg-ui-bg text-brand focus:ring-brand cursor-pointer transition-all" />

							<label 
								htmlFor="remember"
								className="text-sm font-bold text-ui-text cursor-pointer select-none">
									Keep me logged in?
							</label>
					</div>

					<Button
						type="submit"
						isLoading={isLoading}
						className="w-full md:w-40">
							Login
					</Button>

					<div
						className="flex flex-col sm:flex-row justify-between gap-2 text-sm font-bold text-ui-muted">
							<Link
								to="#"
								className="hover:text-brand transition-colors">
									Forgot Username?
							</Link>
							<Link
								to="#"
								className="hover:text-brand transition-colors text-right">
									Forgot Password?
							</Link>
					</div>
			</form>
		</>
	);
}

export default LoginForm;