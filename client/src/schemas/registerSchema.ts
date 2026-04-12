import { z } from "zod";

export const registerSchema = z.object({
	username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username is too long"),
	password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password cannot exceed 72 characters"),
	confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;