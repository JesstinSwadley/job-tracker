interface FormFieldProps {
	label: string;
	id: string;
	error?: string;
	children: React.ReactNode;
}

const FormField = ({ label, id, error, children }: FormFieldProps) => {
	return (
			<div 
				className="space-y-1 w-full">
					<label 
						htmlFor={id}
						className="text-sm font-semibold text-gray-700">
							{label}
					</label>

					{children}

					{
						error && 
						<span
							className="text-xs text-red-500 font-medium">
								{error}
						</span>
					}
			</div>
	)
}

FormField.displayName = "FormField";
export default FormField;