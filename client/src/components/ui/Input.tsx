import { forwardRef, type InputHTMLAttributes } from "react";
import { INPUT_STYLES } from "../../libs/constants";
import FormField from "./FormFieldWrapper";
import { cn } from "../../libs/utils";

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
							cn(
								INPUT_STYLES,
								error && "border-red-500/50 bg-red-500/5 focus:ring-red-500/20",
								className
							)
						}
						{...props} />
			</FormField>
		);
	}
);

Input.displayName = "Input";
export default Input;