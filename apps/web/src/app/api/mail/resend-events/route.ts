import { refreshMailDomainFromProvider } from "@/lib/services/mail-domain.service";

/**
 * Legacy webhook route for domain updates (kept for backward compatibility).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { data?: { id?: string } };
    if (body?.data?.id) {
      return Response.json(
        await refreshMailDomainFromProvider(body.data.id),
        { status: 200 },
      );
    }
    return Response.json({ matched: false }, { status: 200 });
  } catch {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
