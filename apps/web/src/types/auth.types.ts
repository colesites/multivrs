/**
 * Authentication Type Definitions
 *
 * Comprehensive TypeScript types for the authentication system.
 * Provides type-safe interfaces for auth operations, session management,
 * and user data across the application.
 *
 * Requirements:
 * - 18.1: Export TypeScript types for User, Session, and Account models
 * - 18.2: Infer types from Better Auth configuration
 * - 18.6: Provide type-safe error objects with discriminated unions
 * - 18.7: Use strict TypeScript mode with no implicit any
 */

import type { auth } from "@/lib/auth";

/**
 * Session type inferred from Better Auth instance
 * Represents an authenticated user's active session
 */
export type Session = typeof auth.$Infer.Session;

/**
 * User type inferred from Better Auth session
 * Represents the authenticated user's profile data
 */
export type User = typeof auth.$Infer.Session.user;

/**
 * Sign-up form data interface
 * Used for user registration with email/password
 */
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Sign-in form data interface
 * Used for user authentication with email/password
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Password reset form data interface
 * Used for setting a new password during password recovery
 */
export interface PasswordResetData {
  password: string;
  confirmPassword: string;
  token: string;
}

/**
 * Authentication error interface
 * Provides structured error information for auth operations
 */
export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Authentication state interface
 * Represents the complete auth state in the application
 */
export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}
