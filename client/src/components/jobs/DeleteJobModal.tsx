import type { Job } from '../../types'

interface DeleteJobModalProps {
  job: Job
  onConfirm: (id: number) => void
  onCancel: () => void
}

const DeleteJobModal = ({ job, onConfirm, onCancel }: DeleteJobModalProps) => {
	return (
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
				<div className="bg-white rounded-xl shadow-xl border border-slate-200/90 max-w-md w-full p-6 space-y-4">
					{/* Header with Warning Icon */}
					<div className="flex items-start gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600">
							<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.75"
							stroke="currentColor"
							aria-hidden="true">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
							</svg>
						</div>

						<div className="space-y-1">
							<h3 className="text-base font-semibold text-slate-900">Delete Application</h3>

							<p className="text-sm text-slate-600 leading-relaxed">
								Are you sure you want to delete the{' '}
								<strong className="font-semibold text-slate-900">{job.title}</strong> position at{' '}
								<strong className="font-semibold text-slate-900">{job.company}</strong>? Any linked
								assessment or notes will also be removed. This action cannot be undone.
							</p>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onCancel}
							className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
								Cancel
						</button>

						<button
							type="button"
							onClick={() => onConfirm(job.id)}
							className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer">
								Delete Job
						</button>
					</div>
				</div>
		</div>
	)
}

export default DeleteJobModal