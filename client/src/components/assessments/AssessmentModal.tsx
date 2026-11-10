import React, { useState } from 'react'

export interface AssessmentScores {
	career_alignment: number
	experience_match: number
	technical_alignment: number
	compensation_score: number
	work_arrangement: number
	geographic_alignment: number
	growth_value: number
}

interface AssessmentModalProps {
	company: string
	jobTitle: string
	initialScores?: AssessmentScores | null
	onSubmit: (scores: AssessmentScores) => void
	onCancel: () => void
}

const RUBRIC_CRITERIA: Array<{
	key: keyof AssessmentScores
	label: string
	max: number
}> = [
	{ key: 'career_alignment', label: 'Career Alignment', max: 25 },
	{ key: 'experience_match', label: 'Experience Match', max: 20 },
	{ key: 'technical_alignment', label: 'Technical Alignment', max: 15 },
	{ key: 'compensation_score', label: 'Compensation Score', max: 15 },
	{ key: 'work_arrangement', label: 'Work Arrangement', max: 10 },
	{ key: 'geographic_alignment', label: 'Geographic Alignment', max: 5 },
	{ key: 'growth_value', label: 'Growth Value', max: 10 }
]

function getRecommendation(score: number): string {
	if (score >= 85) return 'Apply - Priority'
	if (score >= 75) return 'Apply - Target'
	if (score >= 50) return 'Apply - Stretch'
	return 'Do Not Apply'
}

const AssessmentModal = ({
	company,
	jobTitle,
	initialScores,
	onSubmit,
	onCancel
}: AssessmentModalProps) => {
	const [scores, setScores] = useState<AssessmentScores>({
		career_alignment: initialScores?.career_alignment ?? 0,
		experience_match: initialScores?.experience_match ?? 0,
		technical_alignment: initialScores?.technical_alignment ?? 0,
		compensation_score: initialScores?.compensation_score ?? 0,
		work_arrangement: initialScores?.work_arrangement ?? 0,
		geographic_alignment: initialScores?.geographic_alignment ?? 0,
		growth_value: initialScores?.growth_value ?? 0
	})

	const handleScoreChange = (key: keyof AssessmentScores, rawValue: string, max: number) => {
		let val = parseInt(rawValue, 10)
		if (isNaN(val) || val < 0) val = 0
		if (val > max) val = max

		setScores((prev) => ({ ...prev, [key]: val }))
	}

	const totalScore = Object.values(scores).reduce((sum, current) => sum + current, 0)
	const recommendation = getRecommendation(totalScore)

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		onSubmit(scores)
	}

	return (
		<div
			role="dialog"
			aria-modal="true"
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.4)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000
			}}
		>
			<div
				style={{
					backgroundColor: '#fff',
					padding: '1.5rem',
					borderRadius: '8px',
					maxWidth: '520px',
					width: '90%',
					maxHeight: '90vh',
					overflowY: 'auto'
				}}
			>
				<h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>Opportunity Assessment</h3>
				<p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
					Evaluate <strong>{jobTitle}</strong> at <strong>{company}</strong>
				</p>

				<div
					style={{
						padding: '0.75rem',
						backgroundColor: '#f3f4f6',
						borderRadius: '6px',
						marginBottom: '1.25rem',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<span style={{ fontWeight: 'bold' }}>Total: {totalScore} / 100</span>
					<span style={{ fontWeight: 'bold' }}>{recommendation}</span>
				</div>

				<form onSubmit={handleSubmit}>
					{RUBRIC_CRITERIA.map(({ key, label, max }) => (
						<div
							key={key}
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '0.75rem'
							}}
						>
							<label htmlFor={key} style={{ fontSize: '0.9rem' }}>
								{label} (max {max})
							</label>
							<input
								id={key}
								type="number"
								min={0}
								max={max}
								value={scores[key]}
								onChange={(e) => handleScoreChange(key, e.target.value, max)}
								style={{ width: '60px', padding: '0.25rem' }}
							/>
						</div>
					))}

					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '0.5rem',
							marginTop: '1.5rem'
						}}
					>
						<button type="button" onClick={onCancel}>
							Cancel
						</button>
						<button
							type="submit"
							style={{
								backgroundColor: '#2563eb',
								color: '#fff',
								border: 'none',
								padding: '0.4rem 0.8rem',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							Save Assessment
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AssessmentModal