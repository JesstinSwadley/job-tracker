export class ApiError extends Error {
	status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'ApiError'
		this.status = status
	}
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		...options,
		headers: {
			...(options?.body ? { 'Content-Type': 'applciation/json' } : {}),
			...options?.headers,
		},
	})

	if (!res.ok) {
		const errData = await res.json().catch(() => {})
		throw new ApiError(res.status, errData.error || `Request failed with status ${res.status}`)
	}

	if (res.status === 204) {
		return undefined as T
	}

	return res.json() as Promise<T>
}