/**
 * Convex Synchronization Utilities
 * Syncs user data between Neon Postgres and Convex using HTTP API with retry logic.
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { api } from "@repo/backend/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { logError } from "@/lib/services/logger.service";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
}

const convex = new ConvexHttpClient(convexUrl);

export interface ConvexUserData {
  authId: string;
  email: string;
  name: string;
  image?: string;
}

const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(
  fn: () => Promise<T>,
  operationName: string,
): Promise<T> {
  let lastError: Error | null = null;
  let delay = RETRY_CONFIG.delayMs;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logError("convex.sync.attempt_failed", lastError, {
        attempt,
        operationName,
      });
      if (attempt < RETRY_CONFIG.maxAttempts) {
        await sleep(delay);
        delay *= RETRY_CONFIG.backoffMultiplier;
      }
    }
  }

  throw lastError;
}

/**
 * Sync user data to Convex (creates or updates user record)
 * Requirements: 9.1 (User Creation), 9.2 (User Updates), 9.4 (Hooks), 9.5 (Retry)
 */
export async function syncUserToConvex(
  userData: ConvexUserData,
): Promise<void> {
  await withRetry(async () => {
    await convex.mutation(api.users.syncUser, {
      authId: userData.authId,
      email: userData.email,
      name: userData.name,
      image: userData.image,
    });
  }, `syncUserToConvex(${userData.authId})`);
}

/**
 * Delete user from Convex (removes user and associated data)
 * Requirements: 9.3 (User Deletion), 9.4 (Hooks), 9.5 (Retry)
 */
export async function deleteUserFromConvex(authId: string): Promise<void> {
  await withRetry(async () => {
    await convex.mutation(api.users.deleteUser, { authId });
  }, `deleteUserFromConvex(${authId})`);
}
