import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Your name deserves at least 2 letters 😅"),
  email: z.string().email("That email looks suspicious 🤨"),
  password: z
    .string()
    .min(8, "Minimum 8 characters. Even superheroes need strong passwords 💪"),
  password_confirmation: z.string(),
  role: z.enum(["student", "tutor", "contributor"], {
    message: "Choose your adventure 🎭",
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords must match. We don't like plot twists here.",
  path: ["password_confirmation"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Oops! Your email seems empty 📭")
    .email("Hmm… that doesn't look like a valid email 🤔"),
  
  password: z
    .string()
    .min(8, "Your secret knowledge key must be at least 8 characters 🔐"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Hmm… that doesn't look like a valid email."),
});


export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});