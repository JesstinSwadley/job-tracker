import { useEffect, useState } from "react"
import { fetchJobs, type Job } from "../../services/jobs"


const Dashboard = () => {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadJobs = async () => {
			try {
				const data = await fetchJobs();

				setJobs(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		loadJobs();
	}, []);

	if (loading) return <div>Loading your careers...</div>

	return (
		<>
			<div>
				{jobs.length === 0 ? (
					<p>No jobs tracked yet. Add your first application.</p>
				) : (
					jobs.map(job => <div key={job.id}>{job.company} - {job.position}</div>)
				)}
			</div>
		</>
	)
}

export default Dashboard