import { useState } from "react"
import JobTable from "./components/JobTable"
import NewJobForm from "./components/NewJobForm"
import PopUp from "./components/PopUp";
import RegisterForm from "./components/RegisterForm";
import Nav from "./components/Nav";

function App() {
	const [showNewPopup, setShowNewPopup] = useState<boolean>(false);

	const openNewForm = () => {
		setShowNewPopup(true)
	}

	const closeNewPopUp = () => {
		setShowNewPopup(false)
	}
	
	return (
		<>
			<Nav />

			<button 
				className="mr-3 px-4 py-2 rounded bg-blue-600 text-zinc-100 font-semibold hover:bg-blue-700"
				onClick={openNewForm}>
					<span>New Job</span>
			</button>

			<div>
				<RegisterForm />
			</div>

			<section
				className="flex justify-center m-5">
				<JobTable />
			</section>

			<PopUp
				showPopup={showNewPopup}
				onClose={closeNewPopUp}>
					<NewJobForm />
			</PopUp>
		</>
	)
}

export default App
