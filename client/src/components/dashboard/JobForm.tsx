import { useState, type FormEvent } from "react";
import { createJob, updateJob, type Job } from "../../services/jobs";
import { jobSchema, type JobFormData } from "../../schemas/jobSchema";
import Input from "../ui/Input";
import Select from "../ui/Select";
import TextArea from "../ui/TextArea";
import toast from "react-hot-toast";
import { ApiError } from "../../services/apiClient";
import { LOCATION_OPTIONS, STATUS_OPTIONS } from "../../libs/constants";
import Button from "../ui/Button";

interface JobFormProps {
	onSuccess: () => void;
	jobToEdit?: Job | null;
}

const JobForm = ({ onSuccess, jobToEdit }: JobFormProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof JobFormData, string[]>>>({});

	const isEditMode = !!jobToEdit;

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
			if (err instanceof ApiError) {
				toast.error(err.message);
			} else {
				toast.error(err.message || `The server encountered an error.`);
			}
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
						<Input
							label="Position *"
							id="position"
							name="position" 
							placeholder="Web Developer"
							defaultValue={jobToEdit?.position}
							error={fieldErrors.position?.[0]} />

						<Input 
							label="Company *"
							id="company"
							name="company"
							placeholder="Test Company LLC."
							defaultValue={jobToEdit?.company}
							error={fieldErrors.company?.[0]}/>
				</div>
			

				<div 
					className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Status"
							id="status"
							name="status"
							options={STATUS_OPTIONS} 
							defaultValue={jobToEdit?.status || "Applied"}/>

						<Select
							label="Location"
							id="location_type"
							name="location_type"
							options={LOCATION_OPTIONS}
							defaultValue={jobToEdit?.location_type || "Remote"}/>
				</div>

				<div 
					className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="Salary"
							id="salary"
							name="salary"
							placeholder="$100,000"
							type="text"
							defaultValue={jobToEdit?.salary}/>

						<Input
							label="Source"
							id="source"
							name="source"
							placeholder="LinkedIn, Google, Indeed, etc."
							type="text"
							defaultValue={jobToEdit?.source}/>
				</div>

				<Input 
					label="Job URL"
					id="job_url"
					name="job_url"
					placeholder="https://company.com/careers/role"
					defaultValue={jobToEdit?.job_url}
					error={fieldErrors.job_url?.[0]}
				/>

				<TextArea 
					label="Notes"
					id="notes"
					name="notes"
					placeholder="Recruiter contacted me on LinkedIn, second interview next week..."
					rows={4}
					defaultValue={jobToEdit?.notes}/>


				<div
					className="pt-2">

					<Button
						type="submit"
						isLoading={isLoading}
						className="w-full" >
							{isEditMode ? "Update Job" : "Add Job"}
					</Button>
				</div>
		</form>
	);
};

export default JobForm;