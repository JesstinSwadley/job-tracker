import RegisterForm from '../../components/auth/RegisterForm'

const Register = () => {
	return (
		<div
			className="min-h-screen flex items-center justify-center bg-white px-4">
			<div
				className="w-full max-w-md bg-gray-50 rounded-lg p-8">
					<RegisterForm />
			</div>
		</div>
	)
}

export default Register