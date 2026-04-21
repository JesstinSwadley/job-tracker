import { useEffect, useState } from "react"
import { fetchJobs, type Job } from "../../services/jobs"
import JobCard from "../../components/dashboard/JobCard";
import Modal from "../../components/ui/Modal";
import JobForm from "../../components/dashboard/JobForm";
import { ApiError } from "../../services/apiClient";
import toast from "react-hot-toast";


const Dashboard = () => {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedJob, setSelectedJob] = useState<Job | null>(null);
	const [error, setError] = useState<string | null>(null);

	const loadJobs = async () => {
		try {
			setError(null);

			if (jobs.length === 0) {
				setIsLoading(true);
			}

			const data = await fetchJobs();

			setJobs(data);
		} catch (err) {
			if (err instanceof ApiError) {
				setError(`Server Error (${err.status}): ${err.message}`);
			} else {
				setError("Network error. Please check your connection.");
			}

			toast.error("Could not refresh applications");
		} finally {
			setIsLoading(false);
		}
	}

	const handleEdit = (job: Job) => {
		setSelectedJob(job);
		setIsModalOpen(true);
	}

	const handleAddNew = () => {
		setSelectedJob(null);
		setIsModalOpen(true);
	}

	useEffect(() => {
		loadJobs();
	}, []);

	if (isLoading) {
		return (
			<div
				className="flex h-[60vh] items-center justify-center">
					<div 
						className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-blue-600">
					</div>
			</div>
		)
	}

	if (error && jobs.length === 0) {
		return (
			<div
				className="mx-auto max-w-md py-20 text-center">
					<h2
						className="text-xl font-bold text-stone-900">
							Unable to load jobs
					</h2>
					<p
						className="mt-2 text-stone-500">
							{error}						
					</p>
					<button
						onClick={loadJobs}
						className="mt-6 rounded-xl bg-stone-900 px-6 py-2 text-sm font-bold text-white hover:bg-stone-800 transition">
							Try Again
					</button>
			</div>
		);
	}

	return (
		<div 
			className="mx-auto max-w-4xl p-8">
				<header 
					className="mb-8 flex items-center justify-between">
						<div>
							<h1 
								className="text-2xl font-black text-gray-900">
									My Applications
							</h1>
							<p 
								className="text-gray-500">
									{jobs.length === 0 
										? "Ready to find your dream job"
										: `Tracking {jobs.length} active opportunities`
									}
							</p>
						</div>
						<button 
							onClick={handleAddNew}
							className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">
								+ Add New Job
						</button>
				</header>

			<div
				className="grid gap-4">
					{jobs.length > 0 ? (
						jobs.map(job => (
							<JobCard 
								key={job.id} 
								job={job} 
								onDeleteSuccess={loadJobs}
								onEditClick={() => handleEdit(job)}/>
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

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Track New Application">
					<JobForm
						jobToEdit={selectedJob}
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