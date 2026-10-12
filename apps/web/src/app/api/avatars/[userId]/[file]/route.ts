/**
 * /api/avatars/:userId/:file — a public profile picture. Each upload gets a
 * new file name, so responses can be cached forever.
 */
import { readAvatar } from "@/lib/services/avatar-storage.service";

interface RouteParams {
  params: Promise<{ userId: string; file: string }>;
}

export async function GET(_request: Request, context: RouteParams) {
  const { userId, file } = await context.params;
  const avatar = await readAvatar(userId, file);
  if (!avatar) return new Response("Not found", { status: 404 });
  return new Response(avatar.body, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": avatar.contentType,
      "x-content-type-options": "nosniff",
    },
  });
}
