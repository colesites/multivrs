import { revalidateTag } from "next/cache";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  TEMPLATE_CONTENT_TAG,
  TEMPLATE_STATS_TAG,
} from "@/sanity/lib/template-cache";
import { writeClient } from "@/sanity/lib/write-client";

type TemplatePayload = {
  category?: string;
  description?: string;
  name?: string;
  previewLink?: string;
  price?: string;
  repository?: string;
  stack?: string[];
  status?: "draft" | "in_review";
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sellerId = await requireUserId();
    const { id } = await params;
    const ownsDraft = await writeClient.fetch<string | null>(
      "*[_id == $id && sellerId == $sellerId][0]._id",
      { id, sellerId },
    );
    if (!ownsDraft) return new Response("Not found", { status: 404 });

    const contentType = request.headers.get("content-type") || "";
    const multipart = contentType.includes("multipart/form-data");
    const body = multipart ? await request.formData() : null;
    const payload: TemplatePayload = multipart
      ? JSON.parse(String(body?.get("template") || "{}"))
      : await request.json();

    const fields: Record<string, unknown> = {
      name: payload.name?.trim(),
      description: payload.description?.trim(),
      previewUrl: payload.previewLink?.trim(),
      githubRepository: payload.repository?.trim(),
      price:
        payload.price === "" || payload.price === undefined
          ? undefined
          : Number(payload.price),
      category: payload.category
        ? { _type: "reference", _ref: payload.category }
        : undefined,
      stack: payload.stack?.map((stack) => ({
        _type: "reference",
        _ref: stack,
      })),
      status: payload.status,
    };
    for (const key of Object.keys(fields)) {
      if (fields[key] === undefined) delete fields[key];
    }

    if (multipart && body) {
      const cover = body.get("cover");
      if (cover instanceof File && cover.size > 0) {
        const asset = await writeClient.assets.upload(
          "image",
          Buffer.from(await cover.arrayBuffer()),
          { filename: cover.name },
        );
        fields.coverImage = {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        };
      }
      const gallery = body
        .getAll("gallery")
        .filter((file): file is File => file instanceof File && file.size > 0);
      if (gallery.length) {
        fields.gallery = await Promise.all(
          gallery.map(async (file) => {
            const asset = await writeClient.assets.upload(
              "image",
              Buffer.from(await file.arrayBuffer()),
              { filename: file.name },
            );
            return {
              _key: crypto.randomUUID(),
              _type: "image",
              asset: { _type: "reference", _ref: asset._id },
            };
          }),
        );
      }
    }
    const template = await writeClient.patch(id).set(fields).commit();
    // A seller edit is the only thing that changes template content, so this
    // is where the long-lived content cache gets dropped. Stats go with it in
    // case the template just became published.
    revalidateTag(TEMPLATE_CONTENT_TAG, { expire: 0 });
    revalidateTag(TEMPLATE_STATS_TAG, { expire: 0 });
    return ok({ id: template._id });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sellerId = await requireUserId();
    const { id } = await params;
    const owned = await writeClient.fetch<string | null>(
      "*[_id == $id && sellerId == $sellerId][0]._id",
      { id, sellerId },
    );
    if (!owned) return new Response("Not found", { status: 404 });

    await writeClient.delete(id);
    revalidateTag(TEMPLATE_CONTENT_TAG, { expire: 0 });
    revalidateTag(TEMPLATE_STATS_TAG, { expire: 0 });
    return ok({ id });
  } catch (error) {
    return fail(error);
  }
}
