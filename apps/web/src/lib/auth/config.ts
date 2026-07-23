/**
 * Better Auth Configuration
 *
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 10.1-10.6, 15.7
 *
 * Core configuration for Better Auth including:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub)
 * - Session management (7-day expiration)
 * - Security settings (CSRF, origin validation)
 * - Database adapter (Prisma)
 */

import type { BetterAuthOptions } from "better-auth";
import { username } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { sendOtpEmail } from "@/lib/email/auth-emails";
import { databaseHooks } from "./hooks";
import { generateUniqueUsername } from "./oauth-username";
import { usernameOptions } from "./plugins";
import { adapter } from "./prisma-adapter";
import { rateLimitConfig } from "./rate-limit";

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

/**
 * Better Auth configuration object
 * Exports all settings for the auth server instance
 */
// Use `satisfies` rather than a type annotation so the literal plugin types
// (e.g. the `username` plugin's user-field augmentation) survive inference and
// reach `auth.$Infer.Session`.
export const authConfig = {
  // Database configuration
  database: adapter,

  // Base URL and trusted origins
  baseURL: baseUrl,
  trustedOrigins: [
    "http://localhost:3000",
    "https://multivrs.space",
    "https://www.multivrs.space",
    "https://multivrs.vercel.app",
    "https://*.vercel.app",
  ],

  // Secret for encryption and signing
  secret,

  // Email/password authentication
  // Requirements: 1.1, 1.2, 2.1
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Allow sign-in before verification
    minPasswordLength: 8,
    autoSignIn: true, // Auto sign-in after successful registration
  },

  // OAuth providers
  // Requirements: 3.1, 4.1
  //
  // OAuth users skip the OTP flow (the provider already vouches for the email)
  // and get a username auto-derived from their profile — GitHub `login`, or the
  // local part of a Google email — so social sign-up is a one-click flow with
  // no onboarding step. `mapProfileToUser` runs only at account creation.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      mapProfileToUser: async (profile) => {
        const base = profile.email?.split("@")[0] ?? profile.name ?? "user";
        const username = await generateUniqueUsername(base);
        return { username, displayUsername: profile.name ?? username };
      },
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ),
      mapProfileToUser: async (profile) => {
        const base = profile.login ?? profile.name ?? "user";
        const username = await generateUniqueUsername(base);
        return { username, displayUsername: profile.login ?? username };
      },
    },
  },

  // Session configuration
  // Requirements: 5.1, 5.4, 5.5
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Refresh after 24 hours
  },

  // Account configuration
  // Requirements: 3.7, 4.7 (OAuth token encryption)
  account: {
    encryptOAuthTokens: true, // Use AES-256-GCM encryption for OAuth tokens
  },

  // Security settings
  // Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
  advanced: {
    // CSRF protection (enabled by default, explicitly not disabling)
    disableCSRFCheck: false,

    // Secure cookies in production
    useSecureCookies: process.env.NODE_ENV === "production",

    // Cookie prefix
    cookiePrefix: "multivrs",

    // Default cookie attributes
    defaultCookieAttributes: {
      sameSite: "lax", // Requirement 10.3
    },

    // Cross-subdomain cookies (disabled for security)
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Rate limiting
  // Requirements: 2.5, 10.7, 10.8
  rateLimit: rateLimitConfig,

  // Database hooks for Convex sync
  // Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
  databaseHooks,

  // Security plugins
  // Requirements: 10.1, 10.2
  plugins: [
    username(usernameOptions),
    // Email verification via 6-digit OTP, delivered through Resend.
    // `sendVerificationOnSignUp` auto-emails a code right after registration.
    // NOTE: that auto-send hook only fires when `overrideDefaultEmailVerification`
    // is falsy, so we leave it off — verification is enforced at the dashboard
    // layout layer, not via Better Auth's built-in link flow.
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5, // 5 minutes
      sendVerificationOnSignUp: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOtpEmail({ email, otp, type });
      },
    }),
  ],
} satisfies BetterAuthOptions;
