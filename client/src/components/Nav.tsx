import React, { useState } from 'react'
import PopUp from './PopUp'
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const Nav = () => {
	const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
	const [showRegisterPopup, setShowRegisterPopup] = useState<boolean>(false);

	const openLoginForm = () => {
		setShowLoginPopup(true)
	}

	const openRegisterForm = () => {
		setShowRegisterPopup(true)
	}

	const closeLoginPopUp = () => {
		setShowLoginPopup(false)
	}

	const closeRegisterPopUp = () => {
		setShowRegisterPopup(false)
	}

	return (
		<nav>
			<div></div>
			<div>
				<button
					onClick={openLoginForm}>
					<span>Login</span>
				</button>
			</div>
			<div>
				<button
					onClick={openRegisterForm}>
					<span>Register</span>
				</button>
			</div>

			<PopUp 
				showPopup={showLoginPopup}
				onClose={closeLoginPopUp}>
					<LoginForm />
			</PopUp>
			<PopUp 
				showPopup={showRegisterPopup}
				onClose={closeRegisterPopUp}>
					<RegisterForm />
			</PopUp>
		</nav>
	)
}

export default Nav