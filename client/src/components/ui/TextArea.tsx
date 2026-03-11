import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label: string;
	id: string;
}

const TextArea = ({ label, id, className = "", ...props }: TextAreaProps) => {
	return (
		<div>
			<label 
				className="text-sm font-bold text-black"
				htmlFor={id}>
					{label}
			</label>

			<textarea
				id={id}
				className={`w-full rounded-lg border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${className}`}
				{...props}/>
		</div>
	);
};

export default TextArea;