import { z } from "zod";

export const strongPasswordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .pipe(z.email({ message: "Enter a valid email" }));

export const signUpFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: emailSchema,
  password: strongPasswordSchema,
});

export const signInFormSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
});

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

export const resetPasswordFormSchema = z.object({
  token: z.string().trim().min(1, "Token is required"),
  password: strongPasswordSchema,
});
