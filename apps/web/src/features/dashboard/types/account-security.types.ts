/** A signed-in browser or device on the account. */
export interface AccountSession {
  id: string;
  /** Needed to revoke the session. */
  token: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

/** A passkey registered on the account. */
export interface AccountPasskey {
  id: string;
  name: string | null;
  /** The password manager or device that holds it, when known. */
  provider: string | null;
  createdAt: string | null;
}

export type SocialProvider = "github" | "google";

export interface AccountSignIn {
  /** True when the account can sign in with a password. */
  hasPassword: boolean;
  /** Social providers linked to the account. */
  connected: SocialProvider[];
  /** Social providers this deployment offers. */
  available: SocialProvider[];
  sessions: AccountSession[];
  /** Null when passkeys couldn't be loaded. */
  passkeys: AccountPasskey[] | null;
}

/** Something to clean up before the account can be deleted, and where. */
export interface AccountDeletionBlocker {
  message: string;
  href: string;
}
