import { forwardRef, type SelectHTMLAttributes } from "react";
import FormField from "./FormFieldWrapper";
import { INPUT_STYLES } from "../../libs/constants";
import { ChevronDown } from "lucide-react";

interface Option {
	value: string;
	label: string;
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label: string;
	id: string;
	error?: string;
	options: Option[]
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, id, error, options, className = "", ...props }, ref) => {
		return (
			<FormField
				label={label}
				id={id}
				error={error}>
					<div
						className="relative">
							<select
								ref={ref}
								id={id}
								className={`
									${INPUT_STYLES} appearance-none cursor-pointer 
									${error ? "border-red-200 bg-red-50" : ""} 
									${className}`
								}
								{...props}>
									{options.map((opt) => (
										<option
											key={opt.value}
											value={opt.value}>
												{opt.label}
										</option>
									))}
							</select>

							<div
								className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
									<ChevronDown
										size={18}
										strokeWidth={3} />
							</div>
					</div>
			</FormField>
		);
	}
);

Select.displayName = "Select";
export default Select;