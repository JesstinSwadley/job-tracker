import { X } from "lucide-react";
import { useEffect } from "react";
import { SizeClasses } from "../../libs/constants";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
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
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
				<div
					onClick={(e) => e.stopPropagation()}
					className={`w-full ${SizeClasses[size]} rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200`}>
						<div
							className="mb-6 flex items-center justify-between">
								<h2 
									className="text-xl font-bold text-gray-900">
										{title}
								</h2>

								<button
									onClick={onClose}
									className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
										<X
											size={20}/>
								</button>
						</div>

					<div
						className="max-h-[70vh] overflow-y-auto">
							{children}
					</div>
				</div>
		</div>
	);
};

export default Modal;