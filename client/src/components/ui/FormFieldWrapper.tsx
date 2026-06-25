import { cn } from "../../libs/utils";

interface FormFieldProps {
	label: string;
	id: string;
	error?: string;
	children: React.ReactNode;
	className?: string;
}

const FormField = ({ label, id, error, children, className }: FormFieldProps) => {
	return (
			<div 
				className={
					cn(
						"space-y-2 w-full",
						className
					)
				}>
					<label 
						htmlFor={id}
						className="text-sm font-semibold text-ui-text block">
							{label}
					</label>

					{children}

					{
						error && 
						<p
							role="alert"
							className="text-xs text-ui-error font-medium animate-error-slide">
								{error}
						</p>
					}
			</div>
	)
}

FormField.displayName = "FormField";
export default FormField;