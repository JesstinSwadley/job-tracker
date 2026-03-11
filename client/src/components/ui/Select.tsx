import type { SelectHTMLAttributes } from "react";

interface Option {
	value: string;
	label: string;
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label: string;
	id: string;
	options: Option[]
};

const Select = ({ label, id, options, className = "", ...props }: SelectProps) => {
	return (
		<div
			className="space-y-1">
				<label
					className="text-sm font-bold text-black" 
					htmlFor={id}>
						{label}
				</label>

				<select
					id={id}
					className={`w-full rounded-lg border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none ${className}`}
					{...props}>
						{options.map((opt) => (
							<option
								key={opt.value}
								value={opt.value}>
									{opt.label}
							</option>
						))}
				</select>
		</div>
	);
};

export default Select;