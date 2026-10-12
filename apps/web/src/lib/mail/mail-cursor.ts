/**
 * Keyset cursors for mail lists: the last row's timestamp and id. Paging from
 * a row instead of an offset keeps pages stable while new mail arrives.
 */
export function encodeMailCursor(at: Date, id: string): string {
  return Buffer.from(`${at.toISOString()}|${id}`).toString("base64url");
}

/** The row a cursor points after, or null for a missing or malformed one. */
export function decodeMailCursor(
  cursor: string | null | undefined,
): { at: Date; id: string } | null {
  if (!cursor) return null;
  const [iso, id] = Buffer.from(cursor, "base64url").toString().split("|");
  const at = new Date(iso ?? "");
  return id && !Number.isNaN(at.getTime()) ? { at, id } : null;
}
