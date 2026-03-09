import type { Job } from "../../services/jobs";

interface JobCardProps {
	job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
	const getStatusStyles = (status: string = "Applied") => {
		const styles: Record<string, string> = {
			"Applied": "bg-blue text-blue-700 border-blue-200",
			"Interviewing": "bg-yellow-100 text-yellow-700 border-yellow-200",
			"Offered": "bg-green-100 text-green-700 border-green-200",
			"Rejected": "bg-red-100 text-red-700 border-red-200",
		};

		return styles[status] || styles["Applied"];
	};

	return (
		<div className="group relative flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
			<div className="flex items-center gap-4">
				<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
					{job.company.charAt(0).toUpperCase()}
				</div>

				<div>
					<h3 className="text-lg font-bold text-gray-900 leading-tight">
						{job.position}
					</h3>
					<p className="text-sm font-medium text-gray-500">
						{job.company}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-6">
				<span className={`rounded-full border px-3 py-1 text-xs font-bold transition ${getStatusStyles("Applied")}`}>
					Applied
				</span>


				<button className="text-gray-300 hover:text-blue-600 transition">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
					</svg>
				</button>
			</div>
		</div>
	)
}

export default JobCard