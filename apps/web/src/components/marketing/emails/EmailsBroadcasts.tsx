import { CARD } from "./emails-cards";

export function CampaignComposer() {
  return (
    <div className={`${CARD} p-6 lg:col-span-4 lg:p-8`}>
      <h3 className="text-lg font-medium">Broadcasts & templates</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Write campaigns in a rich editor, reuse versioned templates, and send to
        a consent-aware audience.
      </p>
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:border-white/10 dark:bg-black dark:text-white">
        <div className="space-y-px border-b border-zinc-200 text-xs dark:border-white/10">
          {[
            ["From", "Acme <news@acme.dev>"],
            ["To", "Product updates · 12,480 contacts"],
            ["Subject", "What we shipped in November"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex gap-4 border-b border-zinc-100 px-4 py-2.5 last:border-0 dark:border-white/5"
            >
              <span className="w-14 shrink-0 text-zinc-400">{label}</span>
              <span className="truncate">{value}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-zinc-900 font-mono text-[10px] font-bold text-white dark:bg-white dark:text-black">
                A
              </span>
              <span className="text-xs font-semibold">Acme</span>
            </div>
            <p className="text-base font-semibold tracking-tight">
              Faster builds, smarter previews.
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Hi {"{{first_name}}"}, here is everything new this month, from
              instant rollbacks to a redesigned inbox.
            </p>
            <span className="mt-4 inline-flex rounded-md bg-[#A855F7] px-3 py-1.5 text-[11px] font-semibold text-white">
              Read the changelog
            </span>
          </div>
          <div
            className="hidden h-full min-h-28 w-32 rounded-lg sm:block"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(168,85,247,.55), transparent 60%), radial-gradient(circle at 80% 80%, rgba(34,211,238,.35), transparent 55%), #0b0b10",
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
