import { Link } from "react-router"
const NotFound = () => {
	return (
		<div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
			<h1
				className="text-9xl font-black text-gray-100 absolute -z-10 select-none">
					404
			</h1>

			<div
				className="space-y-4">
					<h2
						className="text-3xl font-bold text-gray-900 md:text-4xl">
							Lost in the clouds?
					</h2>

					<p 
						className="mx-auto max-w-md text-gray-500 font-medium">
							Let's get you back to tracking those jobs!
					</p>
			</div>

			<div 
				className="pt-4">
					<Link
						to={"/dashboard"}
						className="inline-block rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95">
							Back To Dashboard
					</Link>
			</div>
		</div>
	)
}

export default NotFound