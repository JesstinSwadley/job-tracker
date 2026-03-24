import { memo } from 'react';
import { Calendar, DollarSign, ExternalLink, MapPin, Pencil, Trash2 } from "lucide-react";
import { deleteJob, type Job } from "../../services/jobs";

interface JobCardProps {
	job: Job;
	onEditClick: () => void;
	onDeleteSuccess: () => void;
}

const JobCard = ({ job, onEditClick, onDeleteSuccess }: JobCardProps) => {
	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			"Applied": "bg-blue-100 text-blue-700 border-blue-200",
			"Interviewing": "bg-yellow-100 text-yellow-700 border-yellow-200",
			"Offered": "bg-green-100 text-green-700 border-green-200",
			"Rejected": "bg-red-100 text-red-700 border-red-200",
		};
		
		return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
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
			className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
				<div 
					className="flex items-start justify-between mb-4">
						<div>
							<h3 
								className="text-lg font-bold text-gray-900 leading-tight">
									{job.position}
							</h3>
							<p 
								className="text-sm font-semibold text-blue-600">
									{job.company}
							</p>
						</div>

					<span 
						className={`rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${getStatusColor(job.status)}`}>
							{job.status}
					</span>
				</div>

				<div 
					className="grid grid-cols-2 gap-y-2 text-sm text-gray-500 mb-4">
					<div 
						className="flex items-center gap-1.5">
							<MapPin 
								size={14} 
								className="text-gray-400" />
							<span>
								{job.location_type || "Remote"}
							</span> 
					</div>

					{job.salary && (
						<div 
							className="flex items-center gap-1.5">
								<DollarSign 
									size={14} 
									className="text-gray-400" />
								<span 
									className="truncate">
										{job.salary}
								</span>
						</div>
					)}

					{job.source && (
						<div className="flex items-center gap-1.5">
							<Calendar 
								size={14} 
								className="text-gray-400" />
							<span 
								className="truncate">
									{job.source}
							</span>
						</div>
					)}
				</div>

				<div 
					className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
					<div>
						{job.job_url && (
							<a 
								href={job.job_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">
								<ExternalLink 
									size={14} />
								Posting
							</a>
						)}
					</div>

					<div 
						className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onClick={onEditClick}
								className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition">

									<Pencil 
										size={16} />
									<span>
										Edit
									</span>
							</button>

							<button
								onClick={handleDelete}
								className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition">
									<Trash2 
										size={16} />
									<span>
										Delete
									</span>
							</button>
					</div>
				</div> 
		</div>
	);
};

export default memo(JobCard);