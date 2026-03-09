import { useEffect, useState } from "react"
import { fetchJobs, type Job } from "../../services/jobs"
import JobCard from "../../components/dashboard/JobCard";


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
		<div className="mx-auto max-w-4xl p-8">
			<header 
				className="mb-8 flex items-center justify-between">
					<div>
						<h1 
							className="text-2xl font-black text-gray-900">
								My Applications
						</h1>
						<p 
							className="text-gray-500">
								Tracking {jobs.length} active opportunities
						</p>
					</div>
					<button 
						className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">
						+ Add New Job
					</button>
			</header>

			<div className="grid gap-4">
				{jobs.map((job) => (
					<JobCard key={job.id} job={job} />
				))}
			</div>
		</div>
	)
}

export default Dashboard