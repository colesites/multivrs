/**
 * Derive a URL-safe kebab-case slug from a project name.
 * Matches `SLUG_PATTERN` in the API contract (@multivrs/client).
 */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
  return slug || "project";
}
