import { CircleCheck, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fulfillDomainCheckout } from "@/lib/services/domain-fulfillment.service";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function DomainOrderSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const result = await loadFulfillment(sessionId);
  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <section className="w-full max-w-lg border border-white/10 bg-white/[0.025] p-8">
        {result.ok ? (
          <>
            <CircleCheck className="size-10 text-emerald-300" />
            <h1 className="mt-5 font-clash text-3xl font-semibold">
              {result.value.hostname} is yours
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Payment was confirmed and registration completed. Configure its
              DNS records from the domain dashboard.
            </p>
            <Button
              className="mt-7"
              render={
                <Link
                  href={`/${result.value.username}/${result.value.projectSlug}/domains/${result.value.domainId}`}
                />
              }
              nativeButton={false}
            >
              Configure DNS
            </Button>
          </>
        ) : (
          <>
            <LoaderCircle className="size-9 animate-spin text-cyan-300" />
            <h1 className="mt-5 font-clash text-3xl font-semibold">
              Registration is processing
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/50">
              {result.message} Stripe will retry the secure fulfillment webhook
              automatically.
            </p>
            <Button
              className="mt-7"
              render={<Link href="/domains" />}
              nativeButton={false}
            >
              Return to domains
            </Button>
          </>
        )}
      </section>
    </main>
  );
}

async function loadFulfillment(sessionId?: string) {
  if (!sessionId)
    return { ok: false as const, message: "Missing checkout session." };
  try {
    return {
      ok: true as const,
      value: await fulfillDomainCheckout(sessionId),
    };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "We could not confirm the registration yet.",
    };
  }
}
