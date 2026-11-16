import React, { useEffect, useMemo, useState } from 'react'
import { NOTE_SECTIONS, type Job, type JobNote } from '../../types'
import {
	createJobNote,
	deleteJobNote,
	fetchJobNotes,
	updateJobNote,
} from '../../api/notes'

interface JobNotesModalProps {
	job: Job
	onNotesCountChange?: (jobId: number, count: number) => void
	onClose: () => void
}

const SECTION_TABS = ['All', ...NOTE_SECTIONS]

function getSectionBadgeStyle(section: string): string {
	switch (section) {
		case 'Interview':
			return 'bg-indigo-50 text-indigo-700 border-indigo-200'
		case 'Compensation':
			return 'bg-emerald-50 text-emerald-700 border-emerald-200'
		case 'Role':
			return 'bg-sky-50 text-sky-700 border-sky-200'
		case 'General':
		default:
			return 'bg-slate-100 text-slate-700 border-slate-200'
	}
}

function formatTimestamp(iso?: string): string {
	if (!iso) return ''

	const date = new Date(iso)

	if (Number.isNaN(date.getTime())) return iso

	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

const JobNotesModal = ({ job, onNotesCountChange, onClose }: JobNotesModalProps) => {
const [notes, setNotes] = useState<JobNote[]>([])
const [loading, setLoading] = useState(true)
const [submitting, setSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)
const [selectedSection, setSelectedSection] = useState<string>('All')

// Create form state
const [section, setSection] = useState<string>('General')
const [interviewRound, setInterviewRound] = useState<number>(0)
const [content, setContent] = useState('')

// Inline edit state
const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
const [editSection, setEditSection] = useState<string>('General')
const [editInterviewRound, setEditInterviewRound] = useState<number>(0)
const [editContent, setEditContent] = useState('')

useEffect(() => {
	let active = true

	const loadNotes = async () => {
	setLoading(true)
	setError(null)

	try {
		const data = await fetchJobNotes(job.id)
		if (active) {
			setNotes(data)
		}
	} catch (err) {
		if (active) {
			setError(err instanceof Error ? err.message : 'Failed to load notes')
		}
	} finally {
		if (active) {
			setLoading(false)
		}
	}
	}

	loadNotes()
	return () => {
	active = false
	}
}, [job.id])

const handleSectionChange = (nextSection: string) => {
	setSection(nextSection)

	if (nextSection === 'Interview' && interviewRound === 0) {
		setInterviewRound(job.interview_round > 0 ? job.interview_round : 1)
	} else if (nextSection !== 'Interview') {
		setInterviewRound(0)
	}
}

const handleCreateNote = async (e: React.FormEvent<HTMLFormElement>) => {
	e.preventDefault()
	const trimmed = content.trim()

	if (!trimmed || submitting) return

	setSubmitting(true)
	setError(null)

	try {
		const created = await createJobNote(job.id, {
			section,
			interview_round: section === 'Interview' ? interviewRound : 0,
			content: trimmed,
		})

		const nextNotes = [created, ...notes]
		setNotes(nextNotes)
		onNotesCountChange?.(job.id, nextNotes.length)

		setContent('')
		setSection('General')
		setInterviewRound(0)
	} catch (err) {
		setError(err instanceof Error ? err.message : 'Failed to add note')
	} finally {
		setSubmitting(false)
	}
}

const startEditing = (note: JobNote) => {
	setEditingNoteId(note.id)
	setEditSection(note.section || 'General')
	setEditInterviewRound(note.interview_round || 0)
	setEditContent(note.content)
	setError(null)
}

const cancelEditing = () => {
	setEditingNoteId(null)
	setEditContent('')
}

const handleEditSectionChange = (nextSection: string) => {
	setEditSection(nextSection)

	if (nextSection === 'Interview' && editInterviewRound === 0) {
		setEditInterviewRound(1)
	} else if (nextSection !== 'Interview') {
		setEditInterviewRound(0)
	}
}

const handleSaveEdit = async (noteId: number) => {
	const trimmed = editContent.trim()
	if (!trimmed || submitting) return

	setSubmitting(true)
	setError(null)

	try {
		const updated = await updateJobNote(job.id, noteId, {
			section: editSection,
			interview_round: editSection === 'Interview' ? editInterviewRound : 0,
			content: trimmed,
		})

		setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)))
		setEditingNoteId(null)
	} catch (err) {
		setError(err instanceof Error ? err.message : 'Failed to update note')
	} finally {
		setSubmitting(false)
	}
}

const handleDeleteNote = async (noteId: number) => {
	setError(null)
	try {
		await deleteJobNote(job.id, noteId)
		const nextNotes = notes.filter((n) => n.id !== noteId)
		setNotes(nextNotes)

		if (editingNoteId === noteId) {
			setEditingNoteId(null)
		}
		onNotesCountChange?.(job.id, nextNotes.length)
	} catch (err) {
		setError(err instanceof Error ? err.message : 'Failed to delete note')
	}
}

	const filteredNotes = useMemo(() => {
		if (selectedSection === 'All') return notes
		return notes.filter((note) => note.section === selectedSection)
	}, [notes, selectedSection])

	const inputClasses =
		'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors'
	const labelClasses =
		'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5'

	return (
		<div
		role="dialog"
		aria-modal="true"
		className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
		>
		<div className="bg-white rounded-xl shadow-xl border border-slate-200/90 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
			{/* Header */}
			<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
			<div>
				<h3 className="text-base font-semibold text-slate-900">Sectioned Notes</h3>
				<p className="text-xs text-slate-500 mt-0.5">
				<strong className="font-semibold text-slate-800">{job.company}</strong> —{' '}
				<span className="text-slate-700">{job.title}</span>
				</p>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
			>
				Close
			</button>
			</div>

			{/* Scrollable Body */}
			<div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
			{error && (
				<div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center justify-between">
				<span>{error}</span>
				<button
					type="button"
					onClick={() => setError(null)}
					className="text-red-500 hover:text-red-700 font-bold ml-3 cursor-pointer"
				>
					✕
				</button>
				</div>
			)}

			{/* Add Note Form */}
			<form
				onSubmit={handleCreateNote}
				className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-3"
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div>
					<label htmlFor="note-section" className={labelClasses}>
					Section
					</label>
					<select
					id="note-section"
					value={section}
					onChange={(e) => handleSectionChange(e.target.value)}
					className={inputClasses}
					>
					{NOTE_SECTIONS.map((sec) => (
						<option key={sec} value={sec}>
						{sec}
						</option>
					))}
					</select>
				</div>

				{section === 'Interview' && (
					<div>
					<label htmlFor="note-interview-round" className={labelClasses}>
						Interview Round
					</label>
					<input
						id="note-interview-round"
						type="number"
						min={1}
						value={interviewRound}
						onChange={(e) =>
						setInterviewRound(Math.max(1, Number(e.target.value) || 1))
						}
						className={inputClasses}
					/>
					</div>
				)}
				</div>

				<div>
				<label htmlFor="note-content" className={labelClasses}>
					Note Content
				</label>
				<textarea
					id="note-content"
					rows={3}
					value={content}
					placeholder="Log interview takeaways, role expectations, or compensation details..."
					onChange={(e) => setContent(e.target.value)}
					className={`${inputClasses} resize-y`}
				/>
				</div>

				<div className="flex justify-end">
				<button
					type="submit"
					disabled={submitting}
					className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
				>
					Add Note
				</button>
				</div>
			</form>

			{/* Section Filter Tabs */}
			<div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
				{SECTION_TABS.map((tab) => {
				const isActive = selectedSection === tab
				return (
					<button
					key={tab}
					type="button"
					onClick={() => setSelectedSection(tab)}
					className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
						isActive
						? 'bg-slate-900 text-white'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
					}`}
					>
					{tab}
					</button>
				)
				})}
			</div>

			{/* Notes List */}
			{loading ? (
				<div className="py-8 text-center text-xs text-slate-400">Loading notes...</div>
			) : notes.length === 0 ? (
				<div className="py-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
				<p className="text-xs font-medium text-slate-500">No notes logged yet.</p>
				<p className="text-[11px] text-slate-400 mt-1">
					Use the form above to record interview feedback, role research, or comp bands.
				</p>
				</div>
			) : filteredNotes.length === 0 ? (
				<div className="py-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
				<p className="text-xs font-medium text-slate-500">
					No notes in the {selectedSection} section yet.
				</p>
				</div>
			) : (
				<ul className="space-y-3">
				{filteredNotes.map((note) => {
					const isEditing = editingNoteId === note.id

					return (
					<li
						key={note.id}
						className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5"
					>
						{isEditing ? (
						<div className="space-y-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label
								htmlFor={`edit-section-${note.id}`}
								className={labelClasses}
								>
								Edit Section
								</label>
								<select
								id={`edit-section-${note.id}`}
								value={editSection}
								onChange={(e) => handleEditSectionChange(e.target.value)}
								className={inputClasses}
								>
								{NOTE_SECTIONS.map((sec) => (
									<option key={sec} value={sec}>
									{sec}
									</option>
								))}
								</select>
							</div>

							{editSection === 'Interview' && (
								<div>
								<label
									htmlFor={`edit-round-${note.id}`}
									className={labelClasses}
								>
									Edit Interview Round
								</label>
								<input
									id={`edit-round-${note.id}`}
									type="number"
									min={1}
									value={editInterviewRound}
									onChange={(e) =>
									setEditInterviewRound(
										Math.max(1, Number(e.target.value) || 1)
									)
									}
									className={inputClasses}
								/>
								</div>
							)}
							</div>

							<div>
							<label
								htmlFor={`edit-content-${note.id}`}
								className={labelClasses}
							>
								Edit Note Content
							</label>
							<textarea
								id={`edit-content-${note.id}`}
								rows={3}
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className={`${inputClasses} resize-y`}
							/>
							</div>

							<div className="flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={cancelEditing}
								className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={submitting}
								onClick={() => handleSaveEdit(note.id)}
								className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
							>
								Save
							</button>
							</div>
						</div>
						) : (
						<>
							<div className="flex items-center justify-between gap-2 flex-wrap">
							<div className="flex items-center gap-2 flex-wrap text-xs">
								<span
								className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${getSectionBadgeStyle(
									note.section
								)}`}
								>
								{note.section}
								</span>
								{note.section === 'Interview' && note.interview_round > 0 && (
								<span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
									Round {note.interview_round}
								</span>
								)}
								{note.created_at && (
								<span className="text-[11px] text-slate-400">
									{formatTimestamp(note.created_at)}
								</span>
								)}
							</div>

							<div className="flex items-center gap-1.5">
								<button
								type="button"
								onClick={() => startEditing(note)}
								className="px-2 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
								>
								Edit
								</button>
								<button
								type="button"
								onClick={() => handleDeleteNote(note.id)}
								className="px-2 py-1 text-xs font-medium rounded-md border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
								>
								Delete
								</button>
							</div>
							</div>

							<p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
							{note.content}
							</p>
						</>
						)}
					</li>
					)
				})}
				</ul>
			)}
			</div>
		</div>
		</div>
	)
}

export default JobNotesModal