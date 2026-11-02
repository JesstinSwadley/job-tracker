import { useEffect, useState } from 'react'
import CreateJobForm, { type CreateJobInput } from './components/CreateJobForm'
import JobList, { type Job } from './components/JobList'
import type { UpdateJobInput } from './components/UpdateJobForm'
import UpdateJobForm from './components/UpdateJobForm'
import DeleteJobModal from './components/DeleteJobModal'


const App = () => {
	const [jobs, setJobs] = useState<Job[]>([])
	const [loading, setLoading] = useState(true)
	const [editingJob, setEditingJob] = useState<Job | null>(null)
	const [deletingJob, setDeletingJob] = useState<Job | null>(null)
	const [error, setError] = useState<string | null>(null)

	const fetchJobs = async () => {
		try {
			const res = await fetch('/jobs', {
				method: 'GET'
			})

			if (!res.ok) {
				throw new Error('failed to fetch jobs')
			}

			const data: Job[] = await res.json()
			setJobs(data)
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
				body: JSON.stringify(input),
			})

			if (!res.ok) {
				const errData = await res.json()
				throw new Error(errData.error || 'Failed to create job')
			}

			const newJob: Job = await res.json()
			
			setJobs((prev) => [...prev, newJob])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		}
	}

	const handleUpdateJob = async (input: UpdateJobInput) => {
		if (!editingJob) {
			return
		}

		setError(null)

		try {
			const res = await fetch(`/jobs/${editingJob.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(input),
			})

			if (!res.ok) {
				const errData = await res.json()
				
				throw new Error(errData.error || 'Failed to update job')
			}

			const updatedJob: Job = await res.json()

			setJobs((prev) =>
				prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
			)

			setEditingJob(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occured')
		}
	}

	const handleDeleteJob = async (id: number) => {
		setError(null) 

		try {
			const res = await fetch(`/jobs/${id}`, {
				method: 'DELETE'
			})

			if (!res.ok) {
				const errData = await res.json()

				throw new Error(errData.error || 'Failed to update job')
			}

			setJobs((prev) => prev.filter((j) => j.id !== id))
			setDeletingJob(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occured')
		}
	}

	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
			<h1>Job Tracker</h1>

			{editingJob ? (
				<section>
					<h2>Edit Job</h2>

					<UpdateJobForm
						job={editingJob}
						onSubmit={handleUpdateJob}
						onCancel={() => setEditingJob(null)} />
				</section>
			) : (
				<section>
					<h2>Add New Job</h2>

					<CreateJobForm 
						onSubmit={handleCreateJob} />
				</section>
			)}

			{error && <p style={{ color: 'red' }}>Error: {error}</p>}

			<section style={{ marginTop: '2rem' }}>
				<h2>Tracked Job Applications</h2>
				{loading ? (
					<p>Loading Jobs...</p>
				) : (
					<JobList
						jobs={jobs}
						onEdit={setEditingJob}
						onDelete={setDeletingJob} />
				)}
			</section>

			{deletingJob && (
				<DeleteJobModal 
					job={deletingJob}
					onConfirm={handleDeleteJob}
					onCancel={() => setDeletingJob(null)} />
			)}
		</main>
	)
}

export default App