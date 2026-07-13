import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Authentication System
 * 
 * This schema defines real-time user state synced from Neon Postgres.
 * - users: Real-time user presence and profile data
 * - notifications: User notifications with read status
 * 
 * Requirements: 9.7 (Dual Database Synchronization), 18.8 (Type Safety)
 */
export default defineSchema({
  /**
   * Users table - stores real-time user state
   * Synced from Neon Postgres via Better Auth hooks
   */
  users: defineTable({
    authId: v.string(),                    // References Neon user.id (primary identity)
    email: v.string(),                     // User email address
    name: v.string(),                      // User display name
    image: v.optional(v.string()),         // Profile image URL
    presence: v.optional(v.string()),      // User presence: "online" | "away" | "offline"
    lastSeen: v.optional(v.number()),      // Last activity timestamp (milliseconds)
  })
    .index("by_auth_id", ["authId"])       // Query by Neon user ID
    .index("by_email", ["email"]),         // Query by email address

  /**
   * Notifications table - stores user notifications
   * Supports real-time notification delivery and read status tracking
   */
  notifications: defineTable({
    userId: v.id("users"),                 // Reference to users table
    type: v.string(),                      // Notification type (e.g., "info", "warning", "success")
    title: v.string(),                     // Notification title
    message: v.string(),                   // Notification message content
    read: v.boolean(),                     // Read status
    createdAt: v.number(),                 // Creation timestamp (milliseconds)
  })
    .index("by_user", ["userId"])          // Query all notifications for a user
    .index("by_user_unread", ["userId", "read"]), // Query unread notifications efficiently
});
