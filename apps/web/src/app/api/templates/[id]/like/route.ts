import { revalidateTag } from "next/cache";
import { fail, ok } from "@/lib/api/respond";
import { TEMPLATE_STATS_TAG } from "@/sanity/lib/template-cache";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { delta?: number };
    const delta = typeof body.delta === "number" ? body.delta : 1;

    const updated = await writeClient
      .patch(id)
      .setIfMissing({ likes: 0 })
      .inc({ likes: delta })
      .commit({ visibility: "async" });

    revalidateTag(TEMPLATE_STATS_TAG, "max");
    return ok({ likes: updated.likes });
  } catch (error) {
    return fail(error);
  }
}
