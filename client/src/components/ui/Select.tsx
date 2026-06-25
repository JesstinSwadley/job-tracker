import { forwardRef, type SelectHTMLAttributes } from "react";
import FormField from "./FormFieldWrapper";
import { INPUT_STYLES } from "../../libs/constants";
import { ChevronDown } from "lucide-react";
import { cn } from "../../libs/utils";

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
								className={
									cn(
										INPUT_STYLES,
										"appearance-none pr-10 cursor-pointer",
										error && "border-ui-error/50 bg-ui-error/5 focus:ring-red-500/20",
										className
									)
								}
								{...props}>
									{options.map((opt) => (
										<option
											key={opt.value}
											value={opt.value}
											className="bg-ui-card text-ui-text">
												{opt.label}
										</option>
									))}
							</select>

							<div
								className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ui-muted">
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