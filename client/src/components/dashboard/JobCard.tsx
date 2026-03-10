import { deleteJob, type Job } from "../../services/jobs";

interface JobCardProps {
	job: Job;
	onDeleteSuccess: () => void;
	onEditClick: () => void;
}

const JobCard = ({ job, onDeleteSuccess, onEditClick }: JobCardProps) => {
	const getStatusStyles = (status: string = "Applied") => {
		const styles: Record<string, string> = {
			"Applied": "bg-blue-100 text-blue-700 border-blue-200",
			"Interviewing": "bg-yellow-100 text-yellow-700 border-yellow-200",
			"Offered": "bg-green-100 text-green-700 border-green-200",
			"Rejected": "bg-red-100 text-red-700 border-red-200",
		};

		return styles[status] || styles["Applied"];
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();

		if (window.confirm(`Are you sure you want to delete your application for ${job.position}?`)) {
			try {
				await deleteJob(job.id);
				onDeleteSuccess();
			} catch (err) {
				alert("Could not delete job. Please try again.");
			}
		}
    };

	return (
		<div 
			className="group relative flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
				<div 
					className="flex items-center gap-4">
						<div 
							className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
								{job.company.charAt(0).toUpperCase()}
						</div>

						<div>
							<h3 
								className="text-lg font-bold text-gray-900 leading-tight">
									{job.position}
							</h3>
							<p 
								className="text-sm font-medium text-gray-500">
									{job.company}
							</p>
						</div>
				</div>

				<div 
					className="flex items-center gap-6">
						<span 
							className={`rounded-full border px-3 py-1 text-xs font-bold transition ${getStatusStyles("Applied")}`}>
								Applied
						</span>


					<button 
						onClick={onEditClick}
						title="Edit Application"
						className="text-gray-300 hover:text-blue-600 transition p-1">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
							</svg>
					</button>

					<button
						onClick={handleDelete}
						title="Delete Application"
						className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
							</svg>
					</button>
				</div>
		</div>
	);
};

export default JobCard;