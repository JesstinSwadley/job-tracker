import React from 'react'
import { Link } from 'react-router'

const Login = () => {
	return (
		<div>
			<div>
				<form action="">
					<h2>Login</h2>
					<Link
						to="#">
							Need to register an account? Create an account
					</Link>
					
					<div>
						<label 
							htmlFor="emailusername">
								Email or Username
						</label>
						<input 
							type="text" 
							name="emailusername" 
							id="emailusername" />
					</div>
					<div>
						<label 
							htmlFor="password">
								Password
						</label>
						<input 
							type="password" 
							name="password" 
							id="password" />
					</div>

					<input 
						type="checkbox" 
						name="rememberMe" 
						id="rememberMe" />
					<label 
						htmlFor="rememberMe">
							Keep me logged in?
					</label>

					<button>Login</button>

					<Link
						to="#">
							Forgot Username?
					</Link>
					
					<Link
						to="#">
							Forgot Password?
					</Link>
				</form>
			</div>
		</div>
	)
}

export default Login