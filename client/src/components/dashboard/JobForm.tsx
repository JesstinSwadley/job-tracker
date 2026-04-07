import { useState, type FormEvent } from "react";
import { createJob, updateJob, type Job } from "../../services/jobs";
import { jobSchema, type JobFormData } from "../../schemas/jobSchema";
import Input from "../ui/Input";
import Select from "../ui/Select";
import TextArea from "../ui/TextArea";
import toast from "react-hot-toast";

interface JobFormProps {
	onSuccess: () => void;
	jobToEdit?: Job | null;
}

const STATUS_OPTIONS = jobSchema.shape.status.options.map(val => ({
	value: val,
	label: val
}));

const LOCATION_OPTIONS = jobSchema.shape.location_type.options.map(val => ({
	value: val,
	label: val
}));

const JobForm = ({ onSuccess, jobToEdit }: JobFormProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof JobFormData, string[]>>>({});

	const isEditMode = !!jobToEdit;
	const buttonText = isLoading ? "Saving to Database..." : (isEditMode ? "Update Job" : "Add Job");

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setFieldErrors({});

		const formData = new FormData(e.currentTarget);
		const rawData = Object.fromEntries(formData.entries());

		// Form Validation
		const result = jobSchema.safeParse(rawData);

		if (!result.success) {
			const errors: Partial<Record<keyof JobFormData, string[]>> = {};

			result.error.issues.forEach((issue) => {
				const fieldName = issue.path[0] as keyof JobFormData;

				if (!errors[fieldName]) {
					errors[fieldName] = [];
				}

				errors[fieldName].push(issue.message);
			});


			setFieldErrors(errors);
			setIsLoading(false);

			toast.error("Please fix the errors in the form");
			return;
		}

		try {
			const validatedData: JobFormData = result.data;

			if (isEditMode && jobToEdit) {
				await updateJob(jobToEdit.id, validatedData);

				toast.success(`${validatedData.position} at ${validatedData.company} has been updated`);
			} else {
				await createJob(validatedData);

				toast.success(`${validatedData.position} at ${validatedData.company} has been created`);
			}

			onSuccess();
		} catch (err: any) {
			toast.error(err.message || `The server encountered an error.`);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form
			className="space-y-4" 
			onSubmit={handleSubmit}>				
				<div
					className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div
							className="space-y-1">
								<Input
									label="Position *"
									id="positionInput"
									name="position"
									placeholder="Web Developer"
									type="text"
									defaultValue={jobToEdit?.position}
									className={fieldErrors.position ? "border-red-500" : ""}/>

								{fieldErrors.position && (
									<p 
										className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
											{fieldErrors.position[0]}
									</p>
								)}
						</div>

						<div
							className="space-y-1">
								<Input
									label="Company *"
									id="companyInput"
									name="company"
									placeholder="Test Company LLC"
									type="text"
									defaultValue={jobToEdit?.company}
									className={fieldErrors.company ? "border-red-500" : ""}/>

								{fieldErrors.company && (
									<p 
										className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
											{fieldErrors.company[0]}
									</p>
								)}
						</div>
				</div>
			

				<div 
					className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Status"
							id="statusInput"
							name="status"
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

				<div
					className="space-y-1">
						<Input
							label="Job URL"
							id="urlInput"
							name="job_url"
							placeholder="https://company.com/careers/role."
							type="text"
							defaultValue={jobToEdit?.job_url}
							className={fieldErrors.job_url ? "border-red-500" : ""}/>

						{fieldErrors.job_url && (
							<p 
								className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
									{fieldErrors.job_url[0]}
							</p>
						)}
				</div>

				<TextArea 
					label="Notes"
					id="notesInput"
					name="notes"
					placeholder="Recruiter contacted me on LinkedIn, second interview next week..."
					rows={4}
					defaultValue={jobToEdit?.notes}/>


				<div
					className="pt-2">

					<button
						type="submit"
						disabled={isLoading}
						className={`w-full rounded-lg py-3 font-bold text-white transition ${
							isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
					}`}>
						{buttonText}
					</button>
				</div>
		</form>
	);
};

export default JobForm;