import LoginForm from '../../components/auth/LoginForm'

const Login = () => {
	return (
		<div
			className="min-h-screen flex items-center justify-center bg-ui-bg px-4 transition-colors duration-300">
			<div
				className="w-full max-w-md bg-ui-card rounded-brand border border-ui-border p-8 shadow-xl">
					<LoginForm />
			</div>
		</div>
	)
}

export default Login