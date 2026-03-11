import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	id: string;
}

const Input = ({ label, id, className = "", ...props }: InputProps) => {
	return (
		<div
			className="space-y-1">
				<label 
					className="text-sm font-bold text-black"
					htmlFor={id}>
						{label}
				</label>

				<input 
					id={id}
					className={`w-full rounded-lg border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${className}`}
					{...props}/>
		</div>
	)
}

export default Input;