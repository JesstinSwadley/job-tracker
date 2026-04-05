import { useState, type FormEvent } from "react";
import { createJob, updateJob, type Job } from "../../services/jobs";
import Input from "../ui/Input";
import Select from "../ui/Select";
import TextArea from "../ui/TextArea";
import toast from "react-hot-toast";

interface JobFormProps {
	onSuccess: () => void;
	jobToEdit?: Job | null;
}

const STATUS_OPTIONS = [
	{ 
		value: "Applied",
		label: "Applied" 
	},
	{ 
		value: "Interviewing",
		label: "Interviewing" 
	},
	{ 
		value: "Offered",
		label: "Offered"
	},
	{ 
		value: "Rejected",
		label: "Rejected"
	},
];

const LOCATION_OPTIONS = [
	{ 
		value: "Remote",
		label: "Remote"
	},
	{ 
		value: "On-site",
		label: "On-site"
	},
	{ 
		value: "Hybrid",
		label: "Hybrid"
	},
];

const JobForm = ({ onSuccess, jobToEdit }: JobFormProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!jobToEdit;
	const buttonText = isLoading ? "Saving..." : (isEditMode ? "Update Job" : "Add Job");

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);

		const jobData = {
			position: formData.get("position") as string,
			company: formData.get("company") as string,
			status: formData.get("status") as string,
			salary: (formData.get("salary") as string) || undefined,
			job_url: (formData.get("job_url") as string) || undefined,
			source: (formData.get("source") as string) || undefined,
			location_type: (formData.get("location_type") as string) || "Remote",
			notes: (formData.get("notes") as string) || undefined,
		}

		if (!jobData.position || !jobData.company || !jobData.status) {
			setError("Position, Company, and Status are required");
			setIsLoading(false);
			return;
		}

		try {
			if (isEditMode && jobToEdit) {
				await updateJob(jobToEdit.id, jobData);

				toast.success(`${jobData.position} at ${jobData.company} has been updated`);
			} else {
				await createJob(jobData);

				toast.success(`${jobData.position} at ${jobData.company} has been created`);
			}

			onSuccess();
		} catch (err: any) {
			setError(err.message || "Something went wrong. Please try again.");

			toast.error(err.message || `There was an error with ${jobData.position} at ${jobData.company}`);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form
			className="space-y-4" 
			onSubmit={handleSubmit}>
				{error && (
					<p
						className="text-sm font-bold text-red-500">
							{error}
					</p>
				)}
			
				<div
					className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="Position *"
							id="positionInput"
							name="position"
							placeholder="Web Developer"
							type="text"
							required
							defaultValue={jobToEdit?.position}/>

						<Input
							label="Company *"
							id="companyInput"
							name="company"
							placeholder="Test Company LLC"
							type="text"
							required
							defaultValue={jobToEdit?.company}/>
				</div>

				<div 
					className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Status"
							id="statusInput"
							name="status"
							required
							options={STATUS_OPTIONS} 
							defaultValue={jobToEdit?.status || "Applied"}/>

						<Select
							label="Location"
							id="locationTypeInput"
							name="location_type"
							options={LOCATION_OPTIONS}
							defaultValue={jobToEdit?.location_type || "Remote"}/>
				</div>

				<div 
					className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="Salary"
							id="salaryInput"
							name="salary"
							placeholder="$100,000"
							type="text"
							defaultValue={jobToEdit?.salary}/>

						<Input
							label="Source"
							id="sourceInput"
							name="source"
							placeholder="LinkedIn, Google, Indeed, etc."
							type="text"
							defaultValue={jobToEdit?.source}/>
				</div>

				<Input
					label="Job URL"
					id="urlInput"
					name="job_url"
					placeholder="https://company.com/careers/role."
					type="url"
					defaultValue={jobToEdit?.job_url}/>

				<TextArea 
					label="Notes"
					id="notesInput"
					name="notes"
					placeholder="Recruiter contacted me on LinkedIn, second interview next week..."
					rows={4}
					defaultValue={jobToEdit?.notes}/>

				<button
					type="submit"
					disabled={isLoading}
					className={`w-full rounded-lg py-3 font-bold text-white transition ${
						isLoading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
				}`}>
					{buttonText}
				</button>
		</form>
	);
};

export default JobForm;