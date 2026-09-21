/**
 * Removes template documents that were never filled in.
 *
 * The dashboard composer used to create a Sanity document the moment it
 * opened, so closing it without saving left an empty template behind. The
 * composer now creates the document only once a listing has a name, and this
 * script clears out the ones the old behaviour left.
 *
 * Only documents with no name, no content of any kind, and no cover image are
 * touched, and it never deletes anything that was published.
 *
 *   bun --env-file=.env.local apps/web/scripts/cleanup-blank-templates.ts
 *   bun --env-file=.env.local apps/web/scripts/cleanup-blank-templates.ts --apply
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apply = process.argv.includes("--apply");

if (!projectId || !dataset || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET or SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const BLANK_TEMPLATES = `*[
  _type == "template"
  && status != "published"
  && (!defined(name) || name == "")
  && (!defined(price) || price == 0)
  && (!defined(description) || description == "")
  && (!defined(previewUrl) || previewUrl == "")
  && (!defined(githubRepository) || githubRepository == "")
  && (!defined(stack) || count(stack) == 0)
  && !defined(category)
  && !defined(coverImage)
]{ _id, _createdAt, sellerId }`;

async function sanity<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(
    `https://${projectId}.api.sanity.io/v2024-10-01/${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
        ...init?.headers,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T;
}

const { result } = await sanity<{
  result: { _id: string; _createdAt: string; sellerId?: string }[];
}>(`data/query/${dataset}?query=${encodeURIComponent(BLANK_TEMPLATES)}`);

if (result.length === 0) {
  console.log("No blank templates found.");
  process.exit(0);
}

console.log(`Blank templates found: ${result.length}`);
for (const doc of result) {
  console.log(
    `  ${doc._id}  created ${doc._createdAt}  seller ${doc.sellerId ?? "unknown"}`,
  );
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to delete them.");
  process.exit(0);
}

await sanity(`data/mutate/${dataset}`, {
  method: "POST",
  body: JSON.stringify({
    mutations: result.map((doc) => ({ delete: { id: doc._id } })),
  }),
});
console.log(`Deleted ${result.length} blank templates.`);
