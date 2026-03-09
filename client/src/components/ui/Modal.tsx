import { useEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children}: ModalProps) => {
	useEffect(() => {
		if (!isOpen) return;

		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		}

		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleEsc);

		return () => {
			document.body.style.overflow = 'unset';
			window.removeEventListener('keydown', handleEsc);
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			onClick={onClose}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
				<div
					onClick={(e) => e.stopPropagation()}
					className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
						<div
							className="mb-6 flex items-center justify-between">
								<h2 
									className="text-xl font-bold text-black">
										{title}
								</h2>

								<button
									onClick={onClose}
									className="text-gray-400 hover:text-black transition">
										x
								</button>
						</div>

					{children}
				</div>
		</div>
	);
};

export default Modal;