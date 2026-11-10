import React from 'react'

export interface AssessmentBadgeProps {
	totalScore: number
	recommendation: string
	onClick?: () => void
}

function getBadgeClasses(recommendation: string, isClickable: boolean): string {
	const base =
		'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors leading-tight'

	let colorClasses = ''
	switch (recommendation) {
		case 'Apply - Priority':
			colorClasses = isClickable
				? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
				: 'bg-emerald-50 text-emerald-700 border-emerald-200'
			break
		case 'Apply - Target':
			colorClasses = isClickable
				? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
				: 'bg-blue-50 text-blue-700 border-blue-200'
			break
		case 'Apply - Stretch':
			colorClasses = isClickable
				? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
				: 'bg-amber-50 text-amber-700 border-amber-200'
			break
		case 'Do Not Apply':
		default:
			colorClasses = isClickable
				? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
				: 'bg-rose-50 text-rose-700 border-rose-200'
			break
	}

	const interactiveClasses = isClickable
		? 'cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-slate-400'
		: 'cursor-default'

	return `${base} ${colorClasses} ${interactiveClasses}`
}

const AssessmentBadge = ({ totalScore, recommendation, onClick }: AssessmentBadgeProps) => {
	const classes = getBadgeClasses(recommendation, Boolean(onClick))

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={classes}
				title="Click to view or edit assessment"
			>
				<span>{totalScore} / 100</span>
				<span aria-hidden="true" className="opacity-50">•</span>
				<span>{recommendation}</span>
			</button>
		)
	}

	return (
		<span className={classes}>
			<span>{totalScore} / 100</span>
			<span aria-hidden="true" className="opacity-50">•</span>
			<span>{recommendation}</span>
		</span>
	)
}

export default AssessmentBadge