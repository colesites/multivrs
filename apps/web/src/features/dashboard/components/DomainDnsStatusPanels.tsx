import { LockKeyhole, Server, ShieldCheck } from "lucide-react";
import { DomainVerificationValue } from "@/features/dashboard/components/DomainVerificationValue";
import { formatDomainDate } from "@/features/dashboard/lib/domain-date";
import type { DomainDetail, DomainDnsOverview } from "@/lib/domains/dns.types";

export function DomainDnsStatusPanels({
  domain,
  overview,
}: {
  domain: DomainDetail;
  overview: DomainDnsOverview;
}) {
  const nameservers = overview.observedNameservers.length
    ? overview.observedNameservers
    : overview.nameservers;
  return (
    <>
      <div className="mb-10 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-white/45" />
            <h2 className="font-medium">Nameservers</h2>
          </div>
          <div className="mt-4 divide-y divide-white/8 border-y border-white/8">
            {nameservers.map((nameserver) => (
              <p
                key={nameserver}
                className="py-3 font-mono text-xs text-white/65"
              >
                {nameserver}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/35">
            {overview.delegated
              ? "Delegation is active."
              : "The registry is not currently delegated to Multivrs DNS."}
          </p>
        </section>
        <CertificatePanel domain={domain} />
      </div>
      <RegistrationPanel domain={domain} />
    </>
  );
}

function CertificatePanel({ domain }: { domain: DomainDetail }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <LockKeyhole className="size-4 text-white/45" />
        <h2 className="font-medium">TLS certificate</h2>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <ShieldCheck
          className={
            domain.certStatus === "active"
              ? "size-5 text-emerald-400"
              : "size-5 text-white/30"
          }
        />
        <div>
          <p className="text-sm font-medium capitalize">{domain.certStatus}</p>
          <p className="mt-1 text-xs text-white/40">
            {domain.projectId
              ? "Certificate state for the connected project."
              : "Connect a project before certificate provisioning."}
          </p>
        </div>
      </div>
      {domain.certStatus !== "active" &&
      domain.certVerificationName &&
      domain.certVerificationValue ? (
        <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8">
          <DomainVerificationValue
            label="Certificate TXT name"
            value={domain.certVerificationName}
            copy
          />
          <DomainVerificationValue
            label="Certificate TXT value"
            value={domain.certVerificationValue}
            copy
          />
        </div>
      ) : null}
    </section>
  );
}

function RegistrationPanel({ domain }: { domain: DomainDetail }) {
  const expiresAt = domain.expiresAt
    ? formatDomainDate(domain.expiresAt)
    : "Not available";
  const items = [
    ["Registered on", formatDomainDate(domain.registeredAt)],
    ["Expires on", expiresAt],
    ["Provider reference", domain.providerDomainId ?? "Not available"],
  ];
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="font-medium">Registration</h2>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-white/40">{label}</dt>
            <dd className="mt-1 font-medium text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-xs leading-5 text-white/35">
        Registrant contact information is stored with the registrar and is not
        duplicated into this dashboard.
      </p>
    </section>
  );
}
