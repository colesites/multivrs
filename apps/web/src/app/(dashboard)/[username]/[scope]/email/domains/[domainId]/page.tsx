import {
  CheckCircle2,
  ChevronLeft,
  CircleDashed,
  CloudCog,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { MailDomainVerifyButton } from "@/features/mail/MailDomainVerifyButton";
import { getServerSession } from "@/lib/auth/session";
import { isAuthenticatedSendingDomain } from "@/lib/mail/mail-domain-dns";
import { prisma } from "@/lib/prisma";
import { mailDomainDnsMode } from "@/lib/services/mail-domain.service";

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
    include: { dnsRecords: { orderBy: [{ purpose: "asc" }, { name: "asc" }] } },
  });
  if (!domain) notFound();

  const dnsMode = await mailDomainDnsMode(session.user.id, domain.domain);
  const automatic = dnsMode === "automatic";
  const isVerified = isAuthenticatedSendingDomain(domain);

  return (
    <div className="w-full max-w-6xl space-y-8 px-5 py-8 lg:px-8">
      <Link
        href={`/${username}/${scope}/emails?view=domains`}
        className="flex w-fit items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ChevronLeft className="size-4" />
        Back to domains
      </Link>

      <header className="flex flex-col gap-5 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
            Sending domain
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {domain.domain}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <DomainStatus
              verified={isVerified}
              status={
                isVerified
                  ? "verified"
                  : domain.status === "failed"
                    ? "failed"
                    : "pending"
              }
            />
            <span className="text-white/45">
              Region:{" "}
              <span className="text-white/70">{regionName(domain.region)}</span>
            </span>
            <span className="text-white/45">
              DNS:{" "}
              <span className="text-white/70">
                {automatic ? "Managed by Multivrs" : "External provider"}
              </span>
            </span>
          </div>
        </div>
        <MailDomainVerifyButton domainId={domain.id} verified={isVerified} />
      </header>

      <section
        className={`rounded-2xl border px-5 py-5 ${
          automatic
            ? "border-emerald-400/15 bg-emerald-400/[0.045]"
            : "border-blue-400/15 bg-blue-400/[0.045]"
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-black/20">
            {automatic ? (
              <CloudCog className="size-5 text-emerald-300" />
            ) : (
              <ExternalLink className="size-5 text-blue-300" />
            )}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {automatic
                ? "Automatic DNS setup"
                : "Add records at your DNS provider"}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-white/50">
              {automatic
                ? "This domain is registered and DNS-managed by Multivrs. Required sending records are installed and verified automatically; no registrar changes or manual verification are needed."
                : "Keep your domain at Vercel, Namecheap, Cloudflare, or its current provider. Add the records below there. Multivrs automatically detects verification afterward, and you do not need a separate delivery-provider account."}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">
              Authentication records
            </h2>
            <p className="mt-1 text-sm text-white/50">
              SPF authorizes the sending network, DKIM signs each message, and
              DMARC tells inboxes how to validate the visible sender.
            </p>
          </div>
          {domain.verificationCheckedAt ? (
            <p className="font-geist-mono text-[10px] text-white/30">
              Last checked{" "}
              {domain.verificationCheckedAt.toLocaleString("en-US", {
                timeZone: "UTC",
              })}{" "}
              UTC
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#090a0d]">
          <div className="min-w-[1040px]">
            <div className="grid grid-cols-[72px_minmax(220px,1fr)_minmax(300px,1.5fr)_80px_80px_110px] gap-4 border-b border-white/[0.08] bg-white/[0.025] px-4 py-3 font-geist-mono text-[10px] uppercase tracking-[0.13em] text-white/40">
              <span>Type</span>
              <span>Name</span>
              <span>Value</span>
              <span>TTL</span>
              <span>Priority</span>
              <span>Status</span>
            </div>
            {domain.dnsRecords.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-[72px_minmax(220px,1fr)_minmax(300px,1.5fr)_80px_80px_110px] items-center gap-4 border-b border-white/[0.055] px-4 py-4 text-sm last:border-0"
              >
                <span className="w-fit rounded-md border border-white/10 bg-white/5 px-2 py-1 font-geist-mono text-[11px] font-semibold text-white/70">
                  {record.type}
                </span>
                <RecordValue value={record.name} />
                <RecordValue value={record.value} />
                <RecordMetadata value={record.ttl} />
                <RecordMetadata value={record.priority?.toString() ?? "—"} />
                <RecordStatus
                  automatic={automatic && record.managedByMultivrs}
                  status={record.status}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 border-t border-white/[0.08] pt-5 text-xs leading-5 text-white/40">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
        Verification refreshes automatically. Messages remain blocked until the
        sending domain is authenticated, preventing unauthenticated mail from
        damaging your domain reputation.
      </div>
    </div>
  );
}

function RecordMetadata({ value }: { value: string }) {
  return (
    <span className="font-geist-mono text-[12px] tabular-nums text-white/55">
      {value}
    </span>
  );
}

function DomainStatus({
  verified,
  status,
}: {
  verified: boolean;
  status: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-white/70">
      {verified ? (
        <CheckCircle2 className="size-4 text-emerald-400" />
      ) : (
        <CircleDashed className="size-4 text-amber-400" />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
}

function RecordValue({ value }: { value: string }) {
  return (
    <div className="group flex min-w-0 items-center gap-2">
      <span
        className="truncate font-geist-mono text-[12px] text-white/70"
        title={value}
      >
        {value}
      </span>
      <CopyButton text={value} />
    </div>
  );
}

function RecordStatus({
  automatic,
  status,
}: {
  automatic: boolean;
  status: string;
}) {
  const verified = status === "verified";
  return (
    <span className="flex items-center gap-1.5 text-xs text-white/45">
      {verified ? (
        <CheckCircle2 className="size-3.5 text-emerald-400" />
      ) : (
        <CircleDashed className="size-3.5 text-amber-400" />
      )}
      <span className="capitalize">
        {automatic && !verified ? "Managed" : status}
      </span>
    </span>
  );
}

function regionName(region: string) {
  const names: Record<string, string> = {
    "ap-northeast-1": "Tokyo",
    "eu-west-1": "Ireland",
    "sa-east-1": "São Paulo",
    "us-east-1": "N. Virginia",
  };
  return names[region] ?? region;
}
