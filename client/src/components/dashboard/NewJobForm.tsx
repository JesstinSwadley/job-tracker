import { useState, type FormEvent } from "react";
import { createJob } from "../../services/jobs";

interface NewJobFormProps {
	onSuccess: () => void;
}

const NewJobForm = ({ onSuccess }: NewJobFormProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			await createJob(position, company);

			onSuccess();
		} catch (err: any) {
			setError(err.message);
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
					{isLoading ? "Saving..." : "Add Job"}
				</button>
		</form>
	);
}

export default NewJobForm;