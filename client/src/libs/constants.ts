import { jobSchema } from "../schemas/jobSchema";

/**
 * Modal & Layout Sizes 
 */
export const MODAL_SIZES = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-2xl'
} as const;

/**
* Form Styles
*/
export const INPUT_STYLES = "w-full rounded-brand border-2 border-ui-border bg-ui-bg px-4 py-3 text-sm text-ui-text placeholder:text-ui-muted focus:outline-none focus:ring-brand transition-all";

/**
 * Button Sytles
 */

export const BUTTON_BASE = "inline-flex items-center justify-center rounded-brand font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer gap-2";

export const BUTTON_VARIANTS = {
	primary: "bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/20",
	secondary: "bg-ui-border/50 hover:bg-ui-border text-ui-text",
	danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
	ghost: "bg-transparent hover:bg-ui-border text-ui-muted hover:text-ui-text shadow-none",
} as const;

export const BUTTON_SIZES = {
	sm: "px-3 py-1 text-xs",
	md: "px-6 py-3 text-sm",
	lg: "px-8 py-4 text-lg",
} as const;

/**
 * Job Field Options
 */

export const STATUS_OPTIONS = jobSchema.shape.status.options.map(val => ({
	value: val,
	label: val
}));

export const LOCATION_OPTIONS = jobSchema.shape.location_type.options.map(val => ({
	value: val,
	label: val
}));

/**
 * Job Card Styles
 */
export const STATUS_STYLES = {
	Applied: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
	Interviewing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
	Offered: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
	Rejected: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
	Default: "bg-ui-muted/10 text-ui-muted border-ui-border"
} as const;