import { Link } from "react-router"

// import React, { useState } from 'react'
// import PopUp from './PopUp'
// import LoginForm from './LoginForm';
// import RegisterForm from './RegisterForm';

// const Nav = () => {
// 	const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
// 	const [showRegisterPopup, setShowRegisterPopup] = useState<boolean>(false);

// 	const openLoginForm = () => {
// 		setShowLoginPopup(true)
// 	}

// 	const openRegisterForm = () => {
// 		setShowRegisterPopup(true)
// 	}

// 	const closeLoginPopUp = () => {
// 		setShowLoginPopup(false)
// 	}

// 	const closeRegisterPopUp = () => {
// 		setShowRegisterPopup(false)
// 	}

// 	return (
// 		<nav>
// 			<div></div>
// 			<div>
// 				<button
// 					onClick={openLoginForm}>
// 					<span>Login</span>
// 				</button>
// 			</div>
// 			<div>
// 				<button
// 					onClick={openRegisterForm}>
// 					<span>Register</span>
// 				</button>
// 			</div>

// 			<PopUp 
// 				showPopup={showLoginPopup}
// 				onClose={closeLoginPopUp}>
// 					<LoginForm />
// 			</PopUp>
// 			<PopUp 
// 				showPopup={showRegisterPopup}
// 				onClose={closeRegisterPopUp}>
// 					<RegisterForm />
// 			</PopUp>
// 		</nav>
// 	)
// }

const Nav = () => {
	return (
		<nav className="flex flex-row h-24 justify-around bg-stone-200">
			<div className=""></div>
			<div className=""></div>
			<div className="flex flex-col justify-center">
				<Link 
					className="px-4 py-2 bg-blue-500 text-white rounded-md"
					to="/login">Login</Link>
			</div>
		</nav>
	)
}

export default Nav