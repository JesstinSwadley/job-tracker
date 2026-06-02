import { memo } from 'react';
import { DollarSign, ExternalLink, Globe, MapPin, Pencil, Trash2 } from "lucide-react";
import { deleteJob, type Job } from "../../services/jobs";
import toast from 'react-hot-toast';
import { ApiError } from '../../services/apiClient';
import { STATUS_STYLES } from '../../libs/constants';
import Button from '../ui/Button';

interface JobCardProps {
	job: Job;
	onEditClick: () => void;
	onDeleteSuccess: () => void;
}

const JobCard = ({ job, onEditClick, onDeleteSuccess }: JobCardProps) => {
	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();

		if (!window.confirm(`Delete application for ${job.position} at ${job.company}`)) {
			return;
		}

		const toastId = toast.loading("Deleting application...");

		try {
			await deleteJob(job.id);
			toast.success("Application removed", { id: toastId });
			onDeleteSuccess();
		} catch (err) {
			if (err instanceof ApiError) {
				toast.error(err.message, { id: toastId });
			} else {
				toast.error("Failed to delete job.", { id: toastId });
			}
		}
    };

	return (
		<div 
			className="group relative flex flex-col rounded-xl border border-ui-border bg-ui-card p-6 shadow-sm transition-all hover:border-brand/50 hover:shadow-md">
				<div 
					className="flex items-start justify-between mb-4">
						<div
							className="max-w-[70%]">
								<h3 
									className="text-lg font-bold text-ui-text leading-tight truncate">
										{job.position}
								</h3>
								<p 
									className="text-sm font-semibold text-brand truncate">
										{job.company}
								</p>
						</div>

					<span 
						className={`rounded-full border px-2 py-1 text-xs font-bold whitespace-nowrap ${STATUS_STYLES[job.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.Default}`}>
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
							<span
								className="truncate">
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
							<Globe
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
					className="mt-auto flex items-center justify-between border-t border-ui-border pt-4">
					<div>
						{job.job_url && (
							<a 
								href={job.job_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-xs font-bold text-ui-muted hover:text-brand transition-colors">
								<ExternalLink 
									size={14} />
								View Posting
							</a>
						)}
					</div>

					<div 
						className="flex gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
							<Button
								variant="ghost"
								size="sm"
								icon={Pencil}
								onClick={onEditClick}
								className="text-ui-muted hover:text-brand hover:bg-ui-bg">
									Edit
							</Button>

							<Button
								variant="ghost"
								size="sm"
								icon={Trash2}
								onClick={handleDelete}
								className="text-ui-muted hover:text-red-500 hover:bg-red-500/5">
									Delete
							</Button>
					</div>
				</div> 
		</div>
	);
};

export default memo(JobCard);