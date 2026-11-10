import { useEffect, useState, useMemo } from 'react'
import CreateJobForm, { type CreateJobInput } from './components/jobs/CreateJobForm'
import JobList, { type Job } from './components/jobs/JobList'
import type { UpdateJobInput } from './components/jobs/UpdateJobForm'
import UpdateJobForm from './components/jobs/UpdateJobForm'
import DeleteJobModal from './components/jobs/DeleteJobModal'
import AssessmentModal, { type AssessmentScores } from './components/assessments/AssessmentModal'

const STATUS_TABS = ['All', 'Active', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn']

const App = () => {
	const [jobs, setJobs] = useState<Job[]>([])
	const [loading, setLoading] = useState(true)
	const [editingJob, setEditingJob] = useState<Job | null>(null)
	const [deletingJob, setDeletingJob] = useState<Job | null>(null)
	const [assessingJob, setAssessingJob] = useState<Job | null>(null)
	const [initialScores, setInitialScores] = useState<AssessmentScores | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [selectedStatus, setSelectedStatus] = useState('All')
	const [searchQuery, setSearchQuery] = useState('')

	const fetchJobs = async () => {
		try {
			const res = await fetch('/jobs')
			if (!res.ok) {
				throw new Error('Failed to fetch jobs')
			}

			const data: Job[] = await res.json()

			const jobsWithAssessments = await Promise.all(
				data.map(async (job) => {
					try {
						const aRes = await fetch(`/jobs/${job.id}/assessment`)
						if (aRes.ok) {
							const aData = await aRes.json()
							return {
								...job,
								assessment: {
									total_score: aData.total_score,
									recommendation: aData.recommendation
								}
							}
						}
					} catch {
						// Assessment absent or unrated
					}
					return { ...job, assessment: null }
				})
			)

			setJobs(jobsWithAssessments)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchJobs()
	}, [])

	const handleCreateJob = async (input: CreateJobInput) => {
		setError(null)
		try {
			const res = await fetch('/jobs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			})

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}))
				throw new Error(errData.error || 'Failed to create job')
			}

			const newJob: Job = await res.json()
			setJobs((prev) => [{ ...newJob, assessment: null }, ...prev])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		}
	}

	const handleUpdateJob = async (input: UpdateJobInput) => {
		if (!editingJob) return
		setError(null)

		try {
			const res = await fetch(`/jobs/${editingJob.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			})

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}))
				throw new Error(errData.error || 'Failed to update job')
			}

			const updatedJob: Job = await res.json()
			setJobs((prev) =>
				prev.map((j) => (j.id === updatedJob.id ? { ...updatedJob, assessment: j.assessment } : j))
			)
			setEditingJob(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		}
	}

	const handleDeleteJob = async (id: number) => {
		setError(null)
		try {
			const res = await fetch(`/jobs/${id}`, {
				method: 'DELETE'
			})

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}))
				throw new Error(errData.error || 'Failed to delete job')
			}

			setJobs((prev) => prev.filter((j) => j.id !== id))
			setDeletingJob(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		}
	}

	const handleOpenAssess = async (job: Job) => {
		setError(null)
		setAssessingJob(job)
		setInitialScores(null)

		try {
			const res = await fetch(`/jobs/${job.id}/assessment`)
			if (res.ok) {
				const data = await res.json()
				setInitialScores({
					career_alignment: data.career_alignment,
					experience_match: data.experience_match,
					technical_alignment: data.technical_alignment,
					compensation_score: data.compensation_score,
					work_arrangement_score: data.work_arrangement_score,
					geographic_alignment: data.geographic_alignment,
					growth_value: data.growth_value
				})
			}
		} catch {
			// Keep initial scores at zero defaults
		}
	}

	const handleSaveAssessment = async (scores: AssessmentScores) => {
		if (!assessingJob) return
		setError(null)

		try {
			const res = await fetch(`/jobs/${assessingJob.id}/assessment`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(scores)
			})

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}))
				throw new Error(errData.error || 'Failed to save assessment')
			}

			const saved = await res.json()

			setJobs((prev) =>
				prev.map((j) =>
					j.id === assessingJob.id
						? {
							...j,
							assessment: {
								total_score: saved.total_score,
								recommendation: saved.recommendation
							}
						}
						: j
				)
			)

			setAssessingJob(null)
			setInitialScores(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		}
	}

	// Filter pipeline
	const filteredJobs = useMemo(() => {
		return jobs.filter((job) => {
			const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus
			const matchesQuery =
				job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
				job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()))

			return matchesStatus && matchesQuery
		})
	}, [jobs, selectedStatus, searchQuery])

	// Metric summaries
	const metrics = useMemo(() => {
		return {
			total: jobs.length,
			active: jobs.filter((j) => j.status === 'Active' || j.status === 'Interviewing').length,
			priority: jobs.filter((j) => j.assessment?.recommendation === 'Apply - Priority').length
		}
	}, [jobs])

	return (
		<main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Header Section */}
				<header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
					<div>
						<div className="flex items-center gap-2.5">
							<span className="flex h-3 w-3 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
							</span>
							<h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Tracker</h1>
						</div>
						<p className="mt-1 text-sm text-slate-500">
							Track applications, evaluate fit with the rubric engine, and prioritize target roles.
						</p>
					</div>

					{/* Metric Cards */}
					<div className="flex items-center gap-3">
						<div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-center shadow-xs">
							<span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Total</span>
							<span className="text-lg font-bold text-slate-900">{metrics.total}</span>
						</div>
						<div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-center shadow-xs">
							<span className="block text-xs font-medium text-blue-600 uppercase tracking-wider">In Flight</span>
							<span className="text-lg font-bold text-blue-600">{metrics.active}</span>
						</div>
						<div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-center shadow-xs">
							<span className="block text-xs font-medium text-emerald-600 uppercase tracking-wider">Priority</span>
							<span className="text-lg font-bold text-emerald-600">{metrics.priority}</span>
						</div>
					</div>
				</header>

				{/* Error Banner */}
				{error && (
					<div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center justify-between shadow-xs">
						<div className="flex items-center gap-2">
							<span className="font-semibold">Error:</span>
							<span>{error}</span>
						</div>
						<button
							type="button"
							onClick={() => setError(null)}
							className="text-red-500 hover:text-red-700 font-bold ml-4"
						>
							✕
						</button>
					</div>
				)}

				{/* Create / Edit Form Card */}
				<section className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden">
					<div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
						<h2 className="text-base font-semibold text-slate-900">
							{editingJob ? 'Edit Job' : 'Add New Job'}
						</h2>
						{editingJob && (
							<button
								type="button"
								onClick={() => setEditingJob(null)}
								className="text-xs text-slate-500 hover:text-slate-800 font-medium"
							>
								Switch to Add Job
							</button>
						)}
					</div>
					<div className="p-6">
						{editingJob ? (
							<UpdateJobForm
								job={editingJob}
								onSubmit={handleUpdateJob}
								onCancel={() => setEditingJob(null)}
							/>
						) : (
							<CreateJobForm onSubmit={handleCreateJob} />
						)}
					</div>
				</section>

				{/* Tracked Applications Section */}
				<section className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden">
					{/* Filter & Search Toolbar */}
					<div className="p-6 border-b border-slate-100 space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h2 className="text-base font-semibold text-slate-900">
									Tracked Applications ({filteredJobs.length})
								</h2>
								<p className="text-xs text-slate-500 mt-0.5">
									Viewing {filteredJobs.length} of {jobs.length} total entries
								</p>
							</div>

							<div className="w-full sm:w-64">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search company, title, location..."
									className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
								/>
							</div>
						</div>

						{/* Status Filter Tabs */}
						<div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
							{STATUS_TABS.map((tab) => {
								const isActive = selectedStatus === tab
								return (
									<button
										key={tab}
										type="button"
										onClick={() => setSelectedStatus(tab)}
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
					</div>

					{/* Applications List */}
					<div className="p-6">
						{loading ? (
							<div className="py-12 text-center text-slate-400 text-sm">
								<p>Loading jobs...</p>
							</div>
						) : (
							<JobList
								jobs={filteredJobs}
								onEdit={setEditingJob}
								onDelete={setDeletingJob}
								onAssess={handleOpenAssess}
							/>
						)}
					</div>
				</section>
			</div>

			{/* Modals */}
			{deletingJob && (
				<DeleteJobModal
					job={deletingJob}
					onConfirm={handleDeleteJob}
					onCancel={() => setDeletingJob(null)}
				/>
			)}

			{assessingJob && (
				<AssessmentModal
					company={assessingJob.company}
					jobTitle={assessingJob.title}
					initialScores={initialScores}
					onSubmit={handleSaveAssessment}
					onCancel={() => {
						setAssessingJob(null)
						setInitialScores(null)
					}}
				/>
			)}
		</main>
	)
}

export default App