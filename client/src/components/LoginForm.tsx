import React from 'react'

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
				className="shadow-md p-4 mx-4 flex-col bg-white rounded"
				onSubmit={handleSubmit}>
				<div>
					<label
						className="block mb-2 text-sm text-slate-500"
						htmlFor="usernameInput">
						<span>Username</span>
					</label>
					<input
						className="block w-full p-2 bg-white outline-gray-300 placeholder:text-gray-400 outline-solid rounded-sm"
						id="usernameInput"
						name="username"
						type="text"
						required />
				</div>
				<div>
					<label
						className="block mb-2 text-sm text-slate-500"
						htmlFor="passwordInput">
						<span></span>
					</label>
					<input
						className="block w-full p-2 bg-white outline-gray-300 placeholder:text-gray-400 outline-solid rounded-sm"
						id="passwordInput"
						name="password"
						type="password"
						required />
				</div>
				<button
					className="mb-3 p-2 bg-blue-500 text-white rounded cursor-pointer"
					type="submit">
					<span>Login</span>
				</button>
			</form>
		</>
	)
}

export default LoginForm