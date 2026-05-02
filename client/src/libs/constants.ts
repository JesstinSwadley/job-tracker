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
export const INPUT_STYLES = "w-full rounded-lg border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

/**
 * Button Sytles
 */

export const BUTTON_BASE = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer gap-2"

export const BUTTON_VARIANTS = {
	primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100",
	secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
	danger: "bg-red-500 hover:bg-red-600 text-white",
	ghost: "bg-transparent hover:bg-gray-100 text-gray-600 shadow-none",
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
	Applied: "bg-blue-100 text-blue-700 border-blue-200",
	Interviewing: "bg-yellow-100 text-yellow-700 border-yellow-200",
	Offered: "bg-green-100 text-green-700 border-green-200",
	Rejected: "bg-red-100 text-red-700 border-red-200",
	Default: "bg-stone-100 text-stone-700 border-stone-200"
} as const;