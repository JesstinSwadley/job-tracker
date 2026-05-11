import { forwardRef, type TextareaHTMLAttributes } from "react";
import FormField from "./FormFieldWrapper";
import { INPUT_STYLES } from "../../libs/constants";
import { cn } from "../../libs/utils";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label: string;
	id: string;
	error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ label, id, error, className = "", ...props }, ref) => {
		return (
			<FormField
				label={label}
				id={id}
				error={error}>
					<textarea
						ref={ref} 
						id={id}
						// className={`
						// 	${INPUT_STYLES} min-h-[120px] resize-none 
						// 	${error ? "border-red-200 bg-red-50" : ""} 
						// 	${className}`
						// }
						className={
							cn(
								INPUT_STYLES,
								"min-h-[120px] resize-none",
								error && "border-red-500/50 bg-red-500/5",
								className
							)
						}
					{...props}/>
			</FormField>
		)
	}
);

TextArea.displayName = "TextArea";
export default TextArea;