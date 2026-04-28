import { forwardRef, type InputHTMLAttributes } from "react";
import { INPUT_STYLES } from "../../libs/constants";
import FormField from "./FormFieldWrapper";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	id: string;
	error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, id, error, className = "", ...props }, ref) => {
		return (
			<FormField
				label={label}
				id={id}
				error={error}>
					<input 
						ref={ref}
						id={id}
						className={
							`${INPUT_STYLES} 
							${error ? 'border-red-200 bg-red-50' : ''} 
							${className}
						`}
						{...props} />
			</FormField>
		);
	}
);

Input.displayName = "Input";
export default Input;