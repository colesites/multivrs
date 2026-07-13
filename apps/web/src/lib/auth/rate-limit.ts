/**
 * Rate Limiting Configuration
 *
 * Requirements: 2.5, 10.7, 10.8
 *
 * Configures rate limiting for authentication endpoints to prevent abuse.
 * Tracks by IP address for distributed rate limiting.
 */

import type { BetterAuthOptions } from "better-auth";

/**
 * Rate limit configuration for Better Auth
 *
 * Implements rate limiting on authentication endpoints:
 * - Tracks by IP address (Requirement 10.8)
 * - Prevents brute force attacks (Requirements 2.5, 10.7)
 */
export const rateLimitConfig: BetterAuthOptions["rateLimit"] = {
  enabled: true,
  window: 60, // 60 seconds
  max: 10, // 10 requests per window (covers sign-up and sign-in)
};
