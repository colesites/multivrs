/**
 * Authentication Validation Schemas
 *
 * Zod schemas for validating authentication form inputs and API requests.
 * Implements strict validation rules for email/password authentication flows.
 *
 * Requirements:
 * - 1.2: Password strength validation (min 8 chars, uppercase, lowercase, number)
 * - 1.3: Password confirmation matching
 * - 1.7: Email format validation
 * - 18.3: Zod runtime validation for all auth inputs
 * - 18.4: Email format validation using Zod
 * - 18.5: Password strength validation using custom Zod refinements
 */

import { z } from "zod";

/**
 * Password validation schema with strength requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Email validation schema
 * Validates email format using Zod's built-in email validator
 */
export const emailSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

/**
 * Sign-up validation schema
 * Validates user registration with name, email, and password fields
 */
export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z.email({ message: "Please enter a valid email address" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Sign-in validation schema
 * Validates user login with email and password
 */
export const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, "Password is required"),
});

/**
 * Password reset validation schema
 * Validates new password and confirmation during password reset flow
 */
export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Type exports for TypeScript type safety
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
