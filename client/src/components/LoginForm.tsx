import React from 'react'
import { Link } from 'react-router'

// Assign Backend API URL to variable
const API_URL = import.meta.env.VITE_API_URL

const LoginForm = () => {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form: HTMLFormElement = e.target as HTMLFormElement;
		const formData: FormData = new FormData(form);

		const username = formData.get("username");
		const password = formData.get("password");

		await fetch(`${API_URL}/user/login`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				username,
				password
			})
		});
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
								to="#">
									Need to register an account? Create an account
							</Link>
					</div>
				
				<div
					className="space-y-1">
					<label 
						className="text-sm font-bold text-black"
						htmlFor="emailusername">
							Email or Username
					</label>
					<input 
						type="text" 
						name="emailusername" 
						id="emailusername" 
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
					className="w-40 rounded-lg bg-blue-600 py-3 text-lg font-bold text-white hover:bg-blue-700 transition">
						Login
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