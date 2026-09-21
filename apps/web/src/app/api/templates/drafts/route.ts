import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST() {
  try {
    const sellerId = await requireUserId();
    const draft = await writeClient.create({
      _type: "template",
      sellerId,
      status: "draft",
    });
    return ok({ id: draft._id }, 201);
  } catch (error) {
    return fail(error);
  }
}
