import { useState } from 'react'
import CreateJobForm, { type CreateJobInput } from './components/CreateJobForm'

interface Job {
	id: number
	company: string
	position: string
	status: string
}

const App = () => {
	const [latestJob, setLatestJob] = useState<Job | null>(null)
	const [error, setError] = useState<string | null>(null)

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

		const data: Job = await res.json()
		setLatestJob(data)
		} catch (err) {
		setError(err instanceof Error ? err.message : 'An error occurred')
		}
	}

	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
		<h1>Job Tracker</h1>
		<CreateJobForm onSubmit={handleCreateJob} />

		{error && <p style={{ color: 'red' }}>Error: {error}</p>}

		{latestJob && (
			<section style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #ccc' }}>
			<h3>Created Job:</h3>
			<p>
				<strong>#{latestJob.id}</strong> {latestJob.position} at {latestJob.company} (
				<em>{latestJob.status}</em>)
			</p>
			</section>
		)}
		</main>
	)
}

export default App