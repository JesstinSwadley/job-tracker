import JobTable from "./components/JobTable"
import NewJobForm from "./components/NewJobForm"
import UpdateJobForm from "./components/UpdateJobForm"

function App() {
	return (
		<>
			<section 
				className="flex justify-center m-5">
				<NewJobForm />
			</section>

			<section
				className="flex justify-center m-5">
				<JobTable />
			</section>

			<section
				className="flex justify-center m-5">
				<UpdateJobForm />
			</section>'
		</>
	)
}

export default App
