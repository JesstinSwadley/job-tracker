import { useEffect, useState } from 'react';

// Assign Backend API URL to variable
const API_URL = import.meta.env.VITE_API_URL;

type Job = {
	ID: number,
	Position: string,
	Company: string
}

const JobTable = () => {
	const [jobs, setJobs] = useState<Job[]>([]);

	useEffect(() => {
		const fetchJobs = async () => {
			const res = await fetch(`${API_URL}/job/list`);

			const jobList: Job[] = await res.json();

			setJobs([...jobList]);
		}

		fetchJobs();
	}, []);

	console.log(jobs.map(job => console.log(job)));

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
								<td className='px-3'>{job.ID}</td>
								<td className='px-3'>{job.Company}</td>
								<td className='px-3'>{job.Position}</td>
							</tr>
						))
					}
				</tbody>
			</table>
		</div>
	)
}

export default JobTable