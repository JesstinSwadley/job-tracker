import React from 'react'

export interface AssessmentBadgeProps {
	totalScore: number
	recommendation: string
	onClick?: () => void
}

function getBadgeColors(recommendation: string): { bg: string; text: string; border: string } {
	switch (recommendation) {
		case 'Apply - Priority':
			return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' }
		case 'Apply - Target':
			return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }
		case 'Apply - Stretch':
			return { bg: '#fffbeb', text: '#92400e', border: '#fde68a' }
		case 'Do Not Apply':
		default:
			return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' }
	}
}

const AssessmentBadge = ({ totalScore, recommendation, onClick }: AssessmentBadgeProps) => {
	const { bg, text, border } = getBadgeColors(recommendation)

	const style: React.CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '0.4rem',
		padding: '0.2rem 0.5rem',
		borderRadius: '9999px',
		fontSize: '0.75rem',
		fontWeight: 600,
		backgroundColor: bg,
		color: text,
		border: `1px solid ${border}`,
		cursor: onClick ? 'pointer' : 'default',
		textDecoration: 'none',
		lineHeight: 1
	}

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				style={{ ...style, background: bg, border: `1px solid ${border}` }}
				title="Click to view or edit assessment"
			>
				<span>{totalScore} / 100</span>
				<span>•</span>
				<span>{recommendation}</span>
			</button>
		)
	}

	return (
		<span style={style}>
			<span>{totalScore} / 100</span>
			<span>•</span>
			<span>{recommendation}</span>
		</span>
	)
}

export default AssessmentBadge