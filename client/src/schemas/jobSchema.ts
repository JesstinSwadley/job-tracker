import { z } from "zod";

export const jobSchema = z.object({
	position: z.string().min(2, "Position must be at least 2 characters").max(100),
	company: z.string().min(2, "Company name is required").max(100),
	status: z.enum(["Applied", "Interviewing", "Offered", "Rejected"]),
	salary: z.string().optional().or(z.literal("")),
	job_url: z.httpUrl("Please enter a valid web address").optional().or(z.literal("")),
	source: z.string().optional().or(z.literal("")),
	location_type: z.enum(["Remote", "On-site", "Hybrid"]),
	notes: z.string().max(1000, "Notes are too long").optional().or(z.literal("")),
});

export type JobFormData = z.infer<typeof jobSchema>;