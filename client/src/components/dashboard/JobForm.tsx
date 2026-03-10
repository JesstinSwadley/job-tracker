import { useState, type FormEvent } from "react";
import { createJob, updateJob, type Job } from "../../services/jobs";

interface NewJobFormProps {
	onSuccess: () => void;
	jobToEdit?: Job | null;
}

const NewJobForm = ({ onSuccess, jobToEdit }: NewJobFormProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!jobToEdit;
	const buttonText = isLoading ? "Saving..." : (isEditMode ? "Update Job" : "Add Job");

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const position = formData.get("position") as string;
		const company = formData.get("company") as string;

		if (!position || !company) {
			setError("Please fill out all fields.");
			setIsLoading(false);
			return;
		}

		try {
			if (isEditMode && jobToEdit) {
				await updateJob(jobToEdit.id, position, company);
			} else {
				await createJob(position, company);
			}

			onSuccess();
		} catch (err: any) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form
			className="space-y-4" 
			onSubmit={handleSubmit}>

				{
					error && 
					<p
						className="text-sm font-bold text-red-500">
							{error}
					</p>
				}
			
				<div
					className="space-y-1">
						<label 
							className="text-sm font-bold text-black"
							htmlFor="positionInput">
								Position
						</label>
						<input
							required
							id="positionInput"
							name="position"
							defaultValue={jobToEdit?.position || ""}
							placeholder="Web Developer"
							type="text" 
							className="w-full rounded-lg border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
				</div>

				<div
					className="space-y-1">
						<label 
							className="text-sm font-bold text-black"
							htmlFor="companyInput">
								Company
						</label>
						<input
							required
							id="companyInput"
							name="company"
							defaultValue={jobToEdit?.company || ""}
							placeholder="Business LLC"
							type="text" 
							className="w-full rounded-lg border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
				</div>

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
}

export default NewJobForm;