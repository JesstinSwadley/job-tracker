import { forwardRef, type ButtonHTMLAttributes } from "react";
import { BUTTON_BASE, BUTTON_SIZES, BUTTON_VARIANTS } from "../../libs/constants";
import { Loader2, type LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
	variant?: keyof typeof BUTTON_VARIANTS;
	size?: keyof typeof BUTTON_SIZES;
	icon?: LucideIcon;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, isLoading, variant = "primary", size = "md", icon: Icon, className = "", disabled, ...props }, ref) => {
		return (
			<button
				ref={ref}
				disabled={ isLoading || disabled }
				className={`
					${BUTTON_BASE}
					${BUTTON_VARIANTS[variant]}
					${BUTTON_SIZES[size]}
					${className}
				`}
				{...props}
				>
					{isLoading ? (
						<Loader2
							className="h-4 w-4 animate-spin" />
					) : (
						Icon && <Icon size={18} strokeWidth={2.5} />
					)}

					{isLoading ? "Processing..." : children}
			</button>
		);
	}
);

Button.displayName = "Button";
export default Button;