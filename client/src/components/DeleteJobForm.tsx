import React from 'react'

// Assign Backend API URL to variable
const API_URL = import.meta.env.VITE_API_URL

const DeleteJobForm = () => {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form: HTMLFormElement = e.target as HTMLFormElement;
		const formData: FormData = new FormData(form);

		const id = formData.get("id");

		// ID is number
		const idNum: number = Number(id);

		await fetch(`${API_URL}/job/delete`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'PATCH',
			body: JSON.stringify({
				id: idNum,
			})
		});
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
						htmlFor="idInput">
							<span>Position ID</span>
					</label>
					<input
						className='block w-full p-2 bg-white outline-gray-300 placeholder:text-gray-400 outline-solid rounded-sm'
						id="idInput"
						name="id"
						placeholder="Position ID"
						type="text" 
						required />
				</div>

				<button
					className='mb-3 p-2 bg-blue-500 text-white rounded cursor-pointer'
					type='submit'>
					<span>Update Job</span>
				</button>
			</form>
		</>
	)
}

export default DeleteJobForm