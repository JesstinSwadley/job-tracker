import React from 'react'

interface PopupProps {
	showPopup: boolean
	onClose: () => void
}

const PopUp: React.FC<PopupProps> = ({ showPopup, onClose }) => {
	if (!showPopup) {
		return null
	}

	return (
		<div
			className={`${showPopup ? "block" : "hidde n"}`}>
			<button onClick={onClose}>X</button>
			<span>Hi</span>
		</div>
	)
}

export default PopUp