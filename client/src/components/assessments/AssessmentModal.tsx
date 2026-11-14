import React, { useEffect, useState } from 'react'
import type { AssessmentScores } from '../../types'

export type { AssessmentScores }

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
	{ key: 'work_arrangement_score', label: 'Work Arrangement', max: 10 },
	{ key: 'geographic_alignment', label: 'Geographic Alignment', max: 5 },
	{ key: 'growth_value', label: 'Growth Value', max: 10 },
]

function getRecommendation(score: number): string {
	if (score >= 85) return 'Apply - Priority'
	if (score >= 75) return 'Apply - Target'
	if (score >= 50) return 'Apply - Stretch'
	return 'Do Not Apply'
}

function getScoreBannerStyle(recommendation: string): string {
	switch (recommendation) {
		case 'Apply - Priority':
		return 'bg-emerald-50 text-emerald-800 border-emerald-200'
		case 'Apply - Target':
		return 'bg-blue-50 text-blue-800 border-blue-200'
		case 'Apply - Stretch':
		return 'bg-amber-50 text-amber-800 border-amber-200'
		case 'Do Not Apply':
		default:
		return 'bg-rose-50 text-rose-800 border-rose-200'
	}
}

const emptyScores = (): AssessmentScores => ({
	career_alignment: 0,
	experience_match: 0,
	technical_alignment: 0,
	compensation_score: 0,
	work_arrangement_score: 0,
	geographic_alignment: 0,
	growth_value: 0,
})

const AssessmentModal = ({
	company,
	jobTitle,
	initialScores,
	onSubmit,
	onCancel,
}: AssessmentModalProps) => {
	const [scores, setScores] = useState<AssessmentScores>(() => ({
		...emptyScores(),
		...initialScores,
	}))

	useEffect(() => {
		setScores({
		...emptyScores(),
		...initialScores,
		})
	}, [initialScores])

	const handleScoreChange = (key: keyof AssessmentScores, rawValue: string, max: number) => {
		let val = parseInt(rawValue, 10)
		if (isNaN(val) || val < 0) val = 0
		if (val > max) val = max

		setScores((prev) => ({ ...prev, [key]: val }))
	}

	const totalScore = Object.values(scores).reduce((sum, current) => sum + current, 0)
	const recommendation = getRecommendation(totalScore)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		onSubmit(scores)
	}

	return (
		<div
		role="dialog"
		aria-modal="true"
		className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
		>
		<div className="bg-white rounded-xl shadow-xl border border-slate-200/90 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
			{/* Header */}
			<div className="px-6 py-4 border-b border-slate-100 shrink-0">
			<h3 className="text-base font-semibold text-slate-900">Opportunity Assessment</h3>
			<p className="text-xs text-slate-500 mt-0.5">
				Evaluate <strong className="font-semibold text-slate-800">{jobTitle}</strong> at{' '}
				<strong className="font-semibold text-slate-800">{company}</strong>
			</p>
			</div>

			{/* Live Scoring Banner */}
			<div className="px-6 pt-4 shrink-0">
			<div
				className={`p-3.5 rounded-lg border flex items-center justify-between text-sm transition-colors ${getScoreBannerStyle(
				recommendation
				)}`}
			>
				<span className="font-semibold">Total: {totalScore} / 100</span>
				<span className="font-bold tracking-wide">{recommendation}</span>
			</div>
			</div>

			{/* Rubric Input Criteria */}
			<form
			id="assessment-form"
			onSubmit={handleSubmit}
			className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5"
			>
			{RUBRIC_CRITERIA.map(({ key, label, max }) => (
				<div
				key={key}
				className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
				>
				<div className="space-y-0.5 min-w-0">
					<label
					htmlFor={key}
					className="block text-xs font-semibold text-slate-800 cursor-pointer"
					>
					{label}
					</label>
					<span className="block text-[11px] text-slate-400">Maximum: {max} pts</span>
				</div>

				<input
					id={key}
					type="number"
					min={0}
					max={max}
					value={scores[key]}
					onChange={(e) => handleScoreChange(key, e.target.value, max)}
					className="w-16 px-2.5 py-1.5 text-center text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
				/>
				</div>
			))}
			</form>

			{/* Footer Actions */}
			<div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
			<button
				type="button"
				onClick={onCancel}
				className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
			>
				Cancel
			</button>
			<button
				type="submit"
				form="assessment-form"
				className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
			>
				Save Assessment
			</button>
			</div>
		</div>
		</div>
	)
}

export default AssessmentModal