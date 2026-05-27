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
							className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
								{error}
						</p>
					}
			</div>
	)
}

FormField.displayName = "FormField";
export default FormField;