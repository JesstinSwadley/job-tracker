import React from 'react'

// Assign Backend API URL to variable
const API_URL = import.meta.env.VITE_API_URL

const NewJobForm = () => {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form: HTMLFormElement = e.target as HTMLFormElement;
		const formData: FormData = new FormData(form);

		const position = formData.get("positionInput");
		const company = formData.get("companyInput");

		const response = await fetch(`${API_URL}/`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({
				position,
				company
			})
		});

		console.log(response);
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<div>
					<label 
						htmlFor="positionInput">
							<span>Position</span>
					</label>
					<input
						id="positionInput"
						name="position"
						placeholder="Web Developer"
						type="text" 
						required />
				</div>

				<div>
					<label 
						htmlFor="companyInput">
							<span>Company</span>
					</label>
					<input
						id="companyInput"
						name="company"
						placeholder="Business LLC."
						type="text" 
						required />
				</div>

				<button
					type="submit">
					<span>Add New Job</span>
				</button>
			</form>
		</>
	)
}

export default NewJobForm