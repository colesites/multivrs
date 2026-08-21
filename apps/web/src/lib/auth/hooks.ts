/**
 * Database Hooks for Convex Synchronization
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 16.8
 *
 * Configures Better Auth database hooks to automatically sync user data
 * between Neon Postgres and Convex. Implements retry logic for failed
 * sync operations.
 */

import type { BetterAuthOptions } from "better-auth";
import { deleteUserFromConvex, syncUserToConvex } from "@/lib/convex-sync";
import { logError } from "@/lib/services/logger.service";
import {
  deleteSesTenant,
  ensureSesTenant,
} from "@/lib/services/ses-tenant.service";

/**
 * Database hooks configuration
 * Triggers Convex synchronization and SES tenant creation on user lifecycle events
 */
export const databaseHooks: BetterAuthOptions["databaseHooks"] = {
  user: {
    /**
     * After user creation - sync to Convex & provision isolated SES Tenant
     * Requirements: 9.1, 9.4, 9.5
     */
    create: {
      after: async (user) => {
        try {
          await syncUserToConvex({
            authId: user.id,
            email: user.email,
            name: user.name,
            image: user.image || undefined,
          });
        } catch (error) {
          logError("auth.user.created_convex_sync_failed", error, {
            userId: user.id,
          });
        }

        try {
          await ensureSesTenant(user.id);
        } catch (error) {
          logError("auth.user.created_ses_tenant_failed", error, {
            userId: user.id,
          });
        }
      },
    },

    /**
     * After user update - sync changes to Convex
     * Requirements: 9.2, 9.4, 9.5
     */
    update: {
      after: async (user) => {
        try {
          await syncUserToConvex({
            authId: user.id,
            email: user.email,
            name: user.name,
            image: user.image || undefined,
          });
        } catch (error) {
          logError("auth.user.updated_convex_sync_failed", error, {
            userId: user.id,
          });
          // Don't throw - allow update to succeed even if Convex sync fails
        }
      },
    },

    /**
     * After user deletion - remove from Convex & delete SES tenant
     * Requirements: 9.3, 9.4, 9.5
     */
    delete: {
      after: async (user) => {
        try {
          await deleteUserFromConvex(user.id);
        } catch (error) {
          logError("auth.user.deleted_convex_sync_failed", error, {
            userId: user.id,
          });
        }

        try {
          await deleteSesTenant(user.id);
        } catch (error) {
          logError("auth.user.deleted_ses_tenant_failed", error, {
            userId: user.id,
          });
        }
      },
    },
  },
};

