/** `secret` keys are server-only; `publishable` keys are safe in browsers. */
export type ApiKeyKind = "secret" | "publishable";

/** Test-mode keys only ever see test-mode data. */
export type ApiKeyMode = "test" | "live";

export interface ParsedApiKey {
  kind: ApiKeyKind;
  mode: ApiKeyMode;
}

export interface GeneratedApiKey extends ParsedApiKey {
  /** Shown to the merchant exactly once, never stored. */
  plaintext: string;
  /** Safe to store and display, e.g. `sk_test_4f9K…`. */
  displayPrefix: string;
  /** SHA-256 of the plaintext — the only form persisted. */
  hash: string;
}
