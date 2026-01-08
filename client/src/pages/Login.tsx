import React from 'react'
import LoginForm from '../components/LoginForm'

const Login = () => {
	return (
		<div
			className="min-h-screen flex items-center justify-center bg-white px-4">
			<div
				className="w-full max-w-md bg-gray-50 rounded-lg p-8">
					<LoginForm />
			</div>
		</div>
	)
}

export default Login