/**
 * Security Plugins Configuration
 *
 * Requirements: 10.1, 10.2
 *
 * Configures Better Auth security plugins.
 * Sentinel plugin temporarily disabled for debugging.
 */

/**
 * Reserved slugs that cannot be used as a username, because they collide with
 * top-level routes (marketing pages, auth, docs, api). The dashboard lives at
 * `/[username]`, so any of these would shadow a real page.
 */
export const RESERVED_USERNAMES = new Set([
  "home",
  "about",
  "pricing",
  "blog",
  "help",
  "security",
  "domains",
  "startups",
  "agents",
  "observability",
  "fluid",
  "cdn",
  "shipped",
  "plugin",
  "email",
  "emails",
  "legal",
  "login",
  "signup",
  "logout",
  "docs",
  "api",
  "settings",
  "account",
  "admin",
  "dashboard",
  "new",
  "_next",
]);

/**
 * Options for the Better Auth `username` plugin. The plugin itself is added
 * inline at the `betterAuth()` call site in config.ts so TypeScript infers the
 * plugin's user-field augmentation (username/displayUsername) into the Session.
 */
export const usernameOptions = {
  minUsernameLength: 3,
  maxUsernameLength: 30,
  usernameValidator: (value: string) =>
    !RESERVED_USERNAMES.has(value.toLowerCase()),
};
