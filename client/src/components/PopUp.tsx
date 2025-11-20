import React from 'react'

interface PopupProps {
	showPopup: boolean
	onClose: () => void
	children: any
}

const PopUp: React.FC<PopupProps> = ({ showPopup, onClose, children }) => {
	if (!showPopup) {
		return null
	}

	return (
		<div
			className={`fixed inset-0 z-10 p-8 text-white bg-gray-600/90 block ${showPopup ? "block" : "hidden"}`}>
			<button 
				className="px-2 py-1 bg-red-500 text-white rounded-sm"
				onClick={onClose}>
					X
			</button>
				{children}
		</div>
	)
}

export default PopUp