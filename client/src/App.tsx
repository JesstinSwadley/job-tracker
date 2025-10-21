import JobTable from "./components/JobTable"
import NewJobForm from "./components/NewJobForm"

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
		</>
	)
}

export default App
