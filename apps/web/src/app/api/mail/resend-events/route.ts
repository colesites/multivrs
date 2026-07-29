import { verifyResendWebhook } from "@/lib/mail/resend-domain.provider";
import { resendDomainEventSchema } from "@/lib/schemas/mail-provider.schemas";
import { refreshMailDomainFromProvider } from "@/lib/services/mail-domain.service";

export async function POST(request: Request) {
  let event: ReturnType<typeof resendDomainEventSchema.parse>;
  try {
    event = resendDomainEventSchema.parse(
      verifyResendWebhook(await request.text(), request.headers),
    );
  } catch {
    return Response.json({ error: "Invalid Resend webhook" }, { status: 400 });
  }
  if (event.type === "domain.updated") {
    return Response.json(await refreshMailDomainFromProvider(event.data.id), {
      status: 202,
    });
  }
  return Response.json({ matched: false }, { status: 202 });
}
