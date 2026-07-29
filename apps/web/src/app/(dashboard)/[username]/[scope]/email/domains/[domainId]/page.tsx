import { CheckCircle2, ChevronLeft, CircleDashed } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function MailDomainDnsPage({
  params,
}: {
  params: Promise<{ username: string; scope: string; domainId: string }>;
}) {
  const [{ username, scope, domainId }, session] = await Promise.all([
    params,
    getServerSession(),
  ]);
  if (!session) redirect("/login");

  const domain = await prisma.mailDomain.findFirst({
    where: { id: domainId, userId: session.user.id },
    include: { dnsRecords: true },
  });

  if (!domain) notFound();

  const isVerified = domain.status === "verified";

  return (
    <div className="w-full max-w-5xl space-y-8 px-5 py-8 lg:px-8">
      <Link
        href={`/${username}/${scope}/emails?view=domains`}
        className="flex w-fit items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to domains
      </Link>

      <header className="flex items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">{domain.domain}</h1>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                Status
              </span>
              <span className="flex items-center gap-1.5 text-white/70">
                {isVerified ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <CircleDashed className="size-4 text-amber-400" />
                )}
                <span className="capitalize">{domain.status}</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                Region
              </span>
              <span className="text-white/70 capitalize">
                {domain.region === "auto"
                  ? "US East (N. Virginia)"
                  : domain.region}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-white">DNS Records</h2>
          <p className="mt-1 text-sm text-white/50">
            Add these records to your DNS provider to verify ownership and
            enable email sending.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a0d]">
          <div className="grid grid-cols-[100px_1fr_1.5fr_100px] border-b border-white/[0.08] bg-white/[0.025] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.13em] text-white/40">
            <span>Type</span>
            <span>Name</span>
            <span>Value</span>
            <span>Status</span>
          </div>
          {domain.dnsRecords.map((record) => (
            <div
              key={record.id}
              className="grid grid-cols-[100px_1fr_1.5fr_100px] items-center gap-4 border-b border-white/[0.055] px-4 py-4 text-sm last:border-0"
            >
              <span className="w-fit rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] font-semibold text-white/70">
                {record.type}
              </span>

              <div className="group flex items-center gap-2 overflow-hidden">
                <span className="truncate font-mono text-white/70">
                  {record.name}
                </span>
                <CopyButton text={record.name} />
              </div>

              <div className="group flex items-center gap-2 overflow-hidden">
                <span
                  className="truncate font-mono text-white/70"
                  title={record.value}
                >
                  {record.value}{" "}
                  {record.priority !== null
                    ? `(Priority: ${record.priority})`
                    : ""}
                </span>
                <CopyButton
                  text={
                    record.priority !== null
                      ? `${record.priority} ${record.value}`
                      : record.value
                  }
                />
              </div>

              <span className="flex items-center gap-1.5 text-xs text-white/45">
                {record.status === "verified" ? (
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                ) : (
                  <CircleDashed className="size-3.5 text-amber-400" />
                )}
                <span className="capitalize">{record.status}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
