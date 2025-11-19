import { useEffect, useState } from 'react';
import PopUp from './PopUp';

// Assign Backend API URL to variable
const API_URL = import.meta.env.VITE_API_URL;

type Job = {
	ID: number,
	Position: string,
	Company: string
}

const JobTable = () => {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [showPopup, setShowPopup] = useState<boolean>(false);

	useEffect(() => {
		const fetchJobs = async () => {
			const res = await fetch(`${API_URL}/job/list`);

			const jobList: Job[] = await res.json();

			setJobs([...jobList]);
		}

		fetchJobs();
	}, []);

	const openEditForm = () => {
		setShowPopup(true)
	}

	const closePopUp = () => {
		setShowPopup(false)
	}

	return (
		<div
			className='flex-col'>
			<table
				className=''>
				<thead
					className='border-b-2'>
					<tr>
						<th 
							scope='col'
							className='px-3'>Job ID</th>
						<th 
							scope='col'
							className='px-3'>Company</th>
						<th 
							scope='col'
							className='px-3'>Position</th>
					</tr>
				</thead>
				<tbody>
					{
						jobs.map(job => (
							<tr 
								key={job.ID}>
								<td className='px-3 py-5 m-2'>{job.ID}</td>
								<td className='px-3'>{job.Company}</td>
								<td className='px-3'>{job.Position}</td>
								<td>
									<button 
										className="mr-3 px-4 py-2 rounded bg-amber-400 text-stone-900 font-semibold hover:bg-amber-500"
										onClick={openEditForm}>
											<span>Edit</span>
									</button>
								</td>

								<td>
									<button 
										className="mr-3 px-4 py-2 rounded bg-red-600 text-zinc-100 font-semibold hover:bg-red-700">
											<span>Delete</span>
									</button>
								</td>
							</tr>
						))
					}
				</tbody>
			</table>

			<PopUp showPopup={showPopup} onClose={closePopUp}/>
		</div>
	)
}

export default JobTable