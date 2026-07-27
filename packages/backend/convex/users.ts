import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Convex Mutations for User Synchronization
 *
 * These mutations are called from Better Auth hooks to keep Convex
 * in sync with the Neon Postgres database.
 *
 * Requirements: 9.1, 9.2, 9.3
 */

/**
 * Sync user data from Neon to Convex
 * Creates a new user record or updates an existing one
 *
 * @param authId - User ID from Neon Postgres (primary identity)
 * @param email - User email address
 * @param name - User display name
 * @param image - Optional profile image URL
 *
 * Requirements: 9.1 (User Creation), 9.2 (User Updates)
 */
export const syncUser = mutation({
  args: {
    authId: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists in Convex
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", args.authId))
      .unique();

    if (existingUser) {
      // Update existing user record
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        image: args.image,
      });

      return { success: true, userId: existingUser._id, action: "updated" };
    }

    // Create new user record
    const userId = await ctx.db.insert("users", {
      authId: args.authId,
      email: args.email,
      name: args.name,
      image: args.image,
      presence: "offline",
      lastSeen: Date.now(),
    });

    return { success: true, userId, action: "created" };
  },
});

/**
 * Delete user from Convex
 * Removes user record and all associated data
 *
 * @param authId - User ID from Neon Postgres
 *
 * Requirements: 9.3 (User Deletion)
 */
export const deleteUser = mutation({
  args: {
    authId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by authId
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", args.authId))
      .unique();

    if (!user) {
      // User doesn't exist, nothing to delete
      return { success: true, action: "not_found" };
    }

    // Delete all notifications for this user
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Delete user record
    await ctx.db.delete(user._id);

    return { success: true, action: "deleted" };
  },
});

/**
 * Update user presence status
 * Updates real-time presence indicator
 *
 * @param authId - User ID from Neon Postgres
 * @param presence - Presence status: "online" | "away" | "offline"
 */
export const updatePresence = mutation({
  args: {
    authId: v.string(),
    presence: v.union(v.literal("online"), v.literal("away"), v.literal("offline")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", args.authId))
      .unique();

    if (!user) {
      throw new Error(`User with authId ${args.authId} not found`);
    }

    await ctx.db.patch(user._id, {
      presence: args.presence,
      lastSeen: Date.now(),
    });

    return { success: true };
  },
});
