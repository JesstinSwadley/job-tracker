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
			<form
				className='shadow-md p-4 mx-4 flex-col' 
				onSubmit={handleSubmit}>
				<div
					className='mb-5'>
					<label 
						className='block mb-2 text-sm'
						htmlFor="positionInput">
							<span>Position</span>
					</label>
					<input
						className='block w-full p-2 bg-white outline-gray-300 placeholder:text-gray-400 outline-solid rounded-sm'
						id="positionInput"
						name="position"
						placeholder="Web Developer"
						type="text" 
						required />
				</div>

				<div
					className='mb-5'>
					<label 
						className='block mb-2 text-sm'
						htmlFor="companyInput">
							<span>Company</span>
					</label>
					<input
						className='block w-full p-2 bg-white outline-gray-300 placeholder:text-gray-400 outline-solid rounded-sm'
						id="companyInput"
						name="company"
						placeholder="Business LLC."
						type="text" 
						required />
				</div>

				<button
					className='mb-3 p-2 bg-blue-500 text-white rounded cursor-pointer'
					type="submit">
					<span>Add New Job</span>
				</button>
			</form>
		</>
	)
}

export default NewJobForm