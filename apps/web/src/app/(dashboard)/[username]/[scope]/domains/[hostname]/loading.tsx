import { Skeleton } from "@/components/ui/skeleton";

const METADATA_FIELDS = [
  "expiration",
  "renewal",
  "registrar",
  "renewal-mode",
  "registered",
  "nameservers",
  "certificate",
] as const;

export default function LoadingDomainDns() {
  return (
    <div className="w-full px-8 py-6">
      {/* Top Breadcrumb Skeleton */}
      <Skeleton className="h-4 w-44 mb-4 bg-white/10" />

      {/* Title & Action Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-lg bg-white/10" />
          <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-md bg-white/10" />
          <Skeleton className="h-9 w-9 rounded-md bg-white/10" />
        </div>
      </div>

      {/* Horizontal Metadata Stats Bar Skeleton */}
      <div className="mb-10 rounded-xl border border-white/10 bg-background p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {METADATA_FIELDS.map((field) => (
            <div key={field} className="grid gap-1.5">
              <Skeleton className="h-3 w-20 bg-white/10" />
              <Skeleton className="h-4 w-28 bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Connected Projects Section Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-6 w-44 mb-2 bg-white/10" />
        <Skeleton className="h-3 w-72 mb-4 bg-white/10" />
        <div className="rounded-xl border border-white/10 bg-background divide-y divide-white/10">
          <div className="p-4 flex justify-between items-center">
            <Skeleton className="h-4 w-48 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
          </div>
          <div className="p-4 flex justify-between items-center">
            <Skeleton className="h-4 w-40 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
          </div>
        </div>
      </div>

      {/* DNS Records Section Skeleton */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-36 bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 bg-white/10" />
            <Skeleton className="h-8 w-32 bg-white/10" />
          </div>
        </div>
        <Skeleton className="h-3 w-96 mb-4 bg-white/10" />
        <Skeleton className="h-28 w-full rounded-xl bg-white/10 mb-4" />
        <Skeleton className="h-48 w-full rounded-xl bg-white/10" />
      </div>

      {/* Nameservers Section Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-6 w-32 mb-2 bg-white/10" />
        <Skeleton className="h-3 w-80 mb-4 bg-white/10" />
        <Skeleton className="h-32 w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}
