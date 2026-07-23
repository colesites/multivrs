import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDomainDns() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-7">
      <Skeleton className="h-8 w-24" />
      <div className="mt-6 flex items-center gap-4">
        <Skeleton className="size-12 rounded-2xl" />
        <div className="grid gap-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
