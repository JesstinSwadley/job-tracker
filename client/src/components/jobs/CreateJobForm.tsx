import React, { useState } from 'react'
import {
  JOB_SOURCES,
  JOB_STAGES,
  JOB_STATUSES,
  WORK_ARRANGEMENTS,
  type CreateJobInput,
} from '../../types'

export type { CreateJobInput }

interface CreateJobFormProps {
	onSubmit: (job: CreateJobInput) => void
}

const CreateJobForm = ({ onSubmit }: CreateJobFormProps) => {
	const [company, setCompany] = useState('')
	const [title, setTitle] = useState('')
	const [location, setLocation] = useState('')
	const [workArrangement, setWorkArrangement] = useState('')
	const [source, setSource] = useState('')
	const [applicationPlatform, setApplicationPlatform] = useState('')
	const [url, setUrl] = useState('')
	const [stage, setStage] = useState<string>('Search')
	const [interviewRound, setInterviewRound] = useState<number>(0)
	const [status, setStatus] = useState<string>('Active')
	const [datePosted, setDatePosted] = useState('')
	const [dateFound, setDateFound] = useState('')
	const [dateAssessed, setDateAssessed] = useState('')
	const [dateApplied, setDateApplied] = useState('')
	const [resumeUrl, setResumeUrl] = useState('')
	const [coverLetterUrl, setCoverLetterUrl] = useState('')
	const [notes, setNotes] = useState('')

	const handleStageChange = (nextStage: string) => {
			setStage(nextStage)
		if (nextStage === 'Interviewing' && interviewRound === 0) {
			setInterviewRound(1)
		} else if (nextStage !== 'Interviewing') {
			setInterviewRound(0)
		}
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const trimmedCompany = company.trim()
		const trimmedTitle = title.trim()

		if (!trimmedCompany || !trimmedTitle) {
			return
		}

		onSubmit({
			company: trimmedCompany,
			title: trimmedTitle,
			location: location.trim(),
			work_arrangement: workArrangement,
			source,
			application_platform: applicationPlatform.trim(),
			url: url.trim(),
			stage,
			interview_round: stage === 'Interviewing' ? interviewRound : 0,
			status,
			date_posted: datePosted,
			date_found: dateFound,
			date_assessed: dateAssessed,
			date_applied: dateApplied,
			resume_url: resumeUrl.trim(),
			cover_letter_url: coverLetterUrl.trim(),
			notes: notes.trim(),
		})

		setCompany('')
		setTitle('')
		setLocation('')
		setWorkArrangement('')
		setSource('')
		setApplicationPlatform('')
		setUrl('')
		setStage('Search')
		setInterviewRound(0)
		setStatus('Active')
		setDatePosted('')
		setDateFound('')
		setDateAssessed('')
		setDateApplied('')
		setResumeUrl('')
		setCoverLetterUrl('')
		setNotes('')
	}

	const inputClasses = 'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors'
	
	const labelClasses = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5'

	return (
		<form 
			onSubmit={handleSubmit} 
			className="space-y-5">
				{/* Core Role Details */}
				<div 
					className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label htmlFor="company" className={labelClasses}>
								Company <span className="text-rose-500">*</span>
							</label>
							<input
								id="company"
								type="text"
								value={company}
								placeholder="e.g. Stripe, Linear"
								required
								onChange={(e) => setCompany(e.target.value)}
								className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="title" 
								className={labelClasses}>
									Title <span className="text-rose-500">*</span>
							</label>

							<input
								id="title"
								type="text"
								value={title}
								placeholder="e.g. Senior Backend Engineer"
								required
								onChange={(e) => setTitle(e.target.value)}
								className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="location" 
								className={labelClasses}>
									Location
							</label>

							<input
								id="location"
								type="text"
								value={location}
								placeholder="e.g. San Francisco, CA"
								onChange={(e) => setLocation(e.target.value)}
								className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="work-arrangement" 
								className={labelClasses}>
									Work Arrangement
							</label>
							<select
								id="work-arrangement"
								value={workArrangement}
								onChange={(e) => setWorkArrangement(e.target.value)}
								className={inputClasses}>
									<option 
										value="">
											Select Arrangement
									</option>

									{WORK_ARRANGEMENTS.map((arrangement) => (
										<option 
											key={arrangement} 
											value={arrangement}>
												{arrangement}
										</option>
									))}
							</select>
						</div>
				</div>

				{/* Pipeline Stage & Outcome Status */}
				<div 
					className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
						<div>
							<label htmlFor="stage" className={labelClasses}>
								Stage
							</label>
							
							<select
								id="stage"
								value={stage}
								onChange={(e) => handleStageChange(e.target.value)}
								className={inputClasses}>
									{JOB_STAGES.map((opt) => (
										<option 
											key={opt} 
											value={opt}>
												{opt}
										</option>
									))}
							</select>
						</div>

						{stage === 'Interviewing' && (
							<div>
								<label 
									htmlFor="interview-round" 
									className={labelClasses}>
										Interview Round
								</label>

								<input
									id="interview-round"
									type="number"
									min={1}
									value={interviewRound}
									onChange={(e) => setInterviewRound(Math.max(1, Number(e.target.value) || 1))}
									className={inputClasses} />
							</div>
						)}

						<div>

							<label 
								htmlFor="status" 
								className={labelClasses}>
									Status
							</label>
							<select
								id="status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className={inputClasses}>
									{JOB_STATUSES.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
									))}
							</select>
						</div>
				</div>

				{/* Sourcing & Document Links */}
				<div 
					className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
						<div>
							<label htmlFor="source" className={labelClasses}>
								Discovery Source
							</label>
							
							<select
								id="source"
								value={source}
								onChange={(e) => setSource(e.target.value)}
								className={inputClasses}>
									<option 
										value="">
											Select Source
									</option>

									{JOB_SOURCES.map((src) => (
										<option 
											key={src} 
											value={src}>
												{src}
										</option>
									))}
							</select>
						</div>

						<div>
							<label 
								htmlFor="application-platform" 
								className={labelClasses}>
									Application Platform
							</label>

							<input
								id="application-platform"
								type="text"
								value={applicationPlatform}
								placeholder="e.g. Greenhouse, Lever, Workday"
								onChange={(e) => setApplicationPlatform(e.target.value)}
								className={inputClasses} />
						</div>

						<div 
							className="sm:col-span-2">
								<label 
									htmlFor="url" 
									className={labelClasses}>
										Job Posting URL
								</label>

								<input
									id="url"
									type="url"
									value={url}
									placeholder="https://..."
									onChange={(e) => setUrl(e.target.value)}
									className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="resume-url" 
								className={labelClasses}>
									Resume URL (Google Doc)
							</label>

							<input
								id="resume-url"
								type="url"
								value={resumeUrl}
								placeholder="https://docs.google.com/document/d/..."
								onChange={(e) => setResumeUrl(e.target.value)}
								className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="cover-letter-url" 
								className={labelClasses}>
									Cover Letter URL (Google Doc)
							</label>

							<input
								id="cover-letter-url"
								type="url"
								value={coverLetterUrl}
								placeholder="https://docs.google.com/document/d/..."
								onChange={(e) => setCoverLetterUrl(e.target.value)}
								className={inputClasses} />
						</div>
				</div>

				{/* Lifecycle Dates */}
				<div 
					className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
						<div>
							<label 
								htmlFor="date-posted" 
								className={labelClasses}>
									Date Posted
							</label>

							<input
								id="date-posted"
								type="date"
								value={datePosted}
								onChange={(e) => setDatePosted(e.target.value)}
								className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="date-found" 
								className={labelClasses}>
									Date Found
							</label>
							<input
								id="date-found"
								type="date"
								value={dateFound}
								onChange={(e) => setDateFound(e.target.value)}
								className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="date-assessed" 
								className={labelClasses}>
									Date Assessed
							</label>
							<input
								id="date-assessed"
								type="date"
								value={dateAssessed}
								onChange={(e) => setDateAssessed(e.target.value)}
								className={inputClasses} />
						</div>

						<div>
							<label 
								htmlFor="date-applied" 
								className={labelClasses}>
									Date Applied
							</label>

							<input
								id="date-applied"
								type="date"
								value={dateApplied}
								onChange={(e) => setDateApplied(e.target.value)}
								className={inputClasses} />
						</div>
				</div>

				{/* Summary Notes */}
				<div 
					className="pt-2 border-t border-slate-100">
						<label 
							htmlFor="notes" className={labelClasses}>
								Summary Notes
						</label>

						<textarea
							id="notes"
							value={notes}
							rows={3}
							placeholder="High-level summary, referral context, compensation band..."
							onChange={(e) => setNotes(e.target.value)}
							className={`${inputClasses} resize-y`} />
				</div>

				{/* Submit Action */}
				<div 
					className="flex justify-end pt-2">
						<button
							type="submit"
							className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer">
								Add Job
						</button>
				</div>
		</form>
	)
}

export default CreateJobForm