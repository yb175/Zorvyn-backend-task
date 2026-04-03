import { z } from "zod";
import { de } from "zod/locales";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["ADMIN", "ANALYST", "EMPLOYEE"]),
});

export default registerSchema;