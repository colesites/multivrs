import { revalidateTag } from "next/cache";
import { fail, ok } from "@/lib/api/respond";
import { TEMPLATE_STATS_TAG } from "@/sanity/lib/template-cache";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updated = await writeClient
      .patch(id)
      .setIfMissing({ views: 0 })
      .inc({ views: 1 })
      .commit({ visibility: "async" });

    revalidateTag(TEMPLATE_STATS_TAG, "max");
    return ok({ views: updated.views });
  } catch (error) {
    return fail(error);
  }
}
