import { useEffect, useState } from "react"
import { fetchJobs, type Job } from "../../services/jobs"
import JobCard from "../../components/dashboard/JobCard";
import Modal from "../../components/ui/Modal";
import NewJobForm from "../../components/dashboard/NewJobForm";


const Dashboard = () => {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const loadJobs = async () => {
		try {
			const data = await fetchJobs();

			setJobs(data);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadJobs();
	}, []);

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
						onClick={() => setIsModalOpen(true)}
						className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">
							+ Add New Job
					</button>
			</header>

			{
				isLoading ? (
					<div 
						className="flex justify-center py-20">
						<div 
							className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
					</div>
				) : (
					<div 
						className="grid gap-4">
							{jobs.length > 0 ? (
								jobs.map(job => (
									<JobCard 
										key={job.id} 
										job={job} 
										onDeleteSuccess={loadJobs}/>
								))
							) : (
								<div 
									className="rounded-3xl border-2 border-dashed border-gray-100 py-20 text-center">
										<p 
											className="text-lg font-bold text-gray-300">
											Your tracker is empty. Time to apply!
										</p>
								</div>
							)}
					</div>
				)
			}

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Track New Application">
					<NewJobForm
						onSuccess={() => {
							loadJobs();
							setIsModalOpen(false);
						}}
					/>
			</Modal>
		</div>
	);
};

export default Dashboard;