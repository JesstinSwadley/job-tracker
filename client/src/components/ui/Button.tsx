import { forwardRef, type ButtonHTMLAttributes } from "react";
import { BUTTON_BASE, BUTTON_SIZES, BUTTON_VARIANTS } from "../../libs/constants";
import { cn } from "../../libs/utils";
import { Loader2, type LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
	variant?: keyof typeof BUTTON_VARIANTS;
	size?: keyof typeof BUTTON_SIZES;
	icon?: LucideIcon;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, isLoading, variant = "primary", size = "md", icon: Icon, className, disabled, ...props }, ref) => {
		return (
			<button
				ref={ref}
				disabled={ isLoading || disabled }
				className={
					cn(
						BUTTON_BASE,
						BUTTON_VARIANTS[variant],
						BUTTON_SIZES[size],
						className
					)
				}
				{...props}
				>
					{isLoading ? (
						<Loader2
							className="h-4 w-4 animate-spin shrink-0" />
					) : (
						Icon && <Icon 
								size={18} 
								strokeWidth={2.5}
								className="shrink-0" />
					)}

					<span>
						{isLoading ? "Processing..." : children}
					</span>
			</button>
		);
	}
);

Button.displayName = "Button";
export default Button;