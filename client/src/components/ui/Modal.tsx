import { X } from "lucide-react";
import { useEffect } from "react";
import { MODAL_SIZES } from "../../libs/constants";
import { cn } from "../../libs/utils";

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
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-backdrop">
				<div
					onClick={(e) => e.stopPropagation()}
					className={
						cn(
							"w-full bg-ui-card p-6 md:p-8 shadow-2xl animate-modal-content",
							"rounded-brand border border-ui-border",
							MODAL_SIZES[size]
						)
					}>
						<div
							className="mb-6 flex items-center justify-between">
								<h2 
									id="modal-title"
									className="text-xl font-bold text-ui-text">
										{title}
								</h2>

								<button
									onClick={onClose}
									className="p-1 rounded-full text-ui-muted hover:text-ui-text hover:bg-ui-bg transition-all focus:ring-2 focus:ring-brand outline-none">
										<X
											size={20}/>
								</button>
						</div>

					<div
						className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-ui-border">
							{children}
					</div>
				</div>
		</div>
	);
};

export default Modal;