import { useEffect, useState } from 'react'
import CreateJobForm, { type CreateJobInput } from './components/CreateJobForm'
import JobList, { type Job } from './components/JobList'


const App = () => {
	const [jobs, setJobs] = useState<Job[]>([])
	const [loading, setLoading] = useState(true)
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



	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
			<h1>Job Tracker</h1>
			<CreateJobForm 
				onSubmit={handleCreateJob} />

			{error && <p style={{ color: 'red' }}>Error: {error}</p>}

			<section style={{ marginTop: '2rem' }}>
				<h2>Tracked Job Applications</h2>
				{loading ? <p>Loading jobs...</p> : <JobList jobs={jobs} />}
			</section>
		</main>
	)
}

export default App