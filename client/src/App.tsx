import { useEffect, useState } from 'react'
import CreateJobForm, { type CreateJobInput } from './components/jobs/CreateJobForm'
import JobList, { type Job } from './components/jobs/JobList'
import UpdateJobForm, { type UpdateJobInput } from './components/jobs/UpdateJobForm'
import DeleteJobModal from './components/jobs/DeleteJobModal'
import AssessmentModal, { type AssessmentScores } from './components/assessments/AssessmentModal'

const App = () => {
	const [jobs, setJobs] = useState<Job[]>([])
	const [loading, setLoading] = useState(true)
	const [editingJob, setEditingJob] = useState<Job | null>(null)
	const [deletingJob, setDeletingJob] = useState<Job | null>(null)
	const [assessingJob, setAssessingJob] = useState<Job | null>(null)
	const [initialScores, setInitialScores] = useState<AssessmentScores | null>(null)
	const [error, setError] = useState<string | null>(null)

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
						// Assessment not found or unassessed yet
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
					work_arrangement: data.work_arrangement,
					geographic_alignment: data.geographic_alignment,
					growth_value: data.growth_value
				})
			}
		} catch {
			// Keep initial scores at default 0s
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

	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto' }}>
			<h1>Job Tracker</h1>

			{editingJob ? (
				<section>
					<h2>Edit Job</h2>
					<UpdateJobForm
						job={editingJob}
						onSubmit={handleUpdateJob}
						onCancel={() => setEditingJob(null)}
					/>
				</section>
			) : (
				<section>
					<h2>Add New Job</h2>
					<CreateJobForm onSubmit={handleCreateJob} />
				</section>
			)}

			{error && <p style={{ color: '#dc2626', marginTop: '1rem' }}>Error: {error}</p>}

			<section style={{ marginTop: '2.5rem' }}>
				<h2>Tracked Applications ({jobs.length})</h2>
				{loading ? (
					<p>Loading jobs...</p>
				) : (
					<JobList
						jobs={jobs}
						onEdit={setEditingJob}
						onDelete={setDeletingJob}
						onAssess={handleOpenAssess}
					/>
				)}
			</section>

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