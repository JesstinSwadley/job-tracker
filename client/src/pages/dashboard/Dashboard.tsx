import { useEffect, useState } from "react"
import { fetchJobs, type Job } from "../../services/jobs"
import JobCard from "../../components/dashboard/JobCard";
import Modal from "../../components/ui/Modal";
import JobForm from "../../components/dashboard/JobForm";
import { ApiError } from "../../services/apiClient";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";


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
				className="flex h-[60vh] items-center justify-center bg-ui-bg">
					<div 
						className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent shadow-xl shadow-brand/10">
					</div>
			</div>
		)
	}

	if (error && jobs.length === 0) {
		return (
			<div
				className="mx-auto max-w-md py-20 text-center">
					<h2
						className="text-xl font-black text-ui-text uppercase tracking-tight">
							Unable to load jobs
					</h2>
					<p
						className="mt-2 text-sm font-semibold text-ui-muted">
							{error}						
					</p>
					<button
						onClick={loadJobs}
						className="mt-6 mx-auto">
							Try Again
					</button>
			</div>
		);
	}

	return (
		<div 
			className="w-full px-2 py-4">
				<header 
					className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h1 
								className="text-2xl md:text-3xl font-black text-ui-text tracking-tight uppercase">
									My Applications
							</h1>
							<p 
								className="text-sm font-semibold text-ui-muted mt-0.5">
									{jobs.length === 0 
										? "Ready to find your dream job"
										: `Tracking ${jobs.length} active opportunities`
									}
							</p>
						</div>
						
						<Button
							className="w-full sm:w-auto">
								+ Add New Job
						</Button>
				</header>

			<div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
							className="col-span-1 md:col-span-2 lg:col-span-3 rounded-2xl border-2 border-dashed border-ui-border bg-ui-card/50 py-24 text-center">
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
				title={selectedJob ? "Edit Application" : "Track New Application"}>
					<JobForm
						key={selectedJob?.id || 'new'}
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