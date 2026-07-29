export function MailPageSkeleton() {
  return (
    <div
      aria-label="Loading mail"
      role="status"
      className="flex min-h-[calc(100vh-3.5rem)] animate-pulse"
    >
      <div className="hidden w-[340px] shrink-0 border-r border-[var(--hairline)] p-4 md:block">
        <div className="mb-5 h-8 rounded-lg bg-white/[0.045]" />
        {["one", "two", "three", "four", "five", "six", "seven"].map((key) => (
          <div className="mb-3 space-y-2" key={key}>
            <div className="h-3 w-2/3 rounded bg-white/[0.055]" />
            <div className="h-2.5 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-8 h-8 w-1/3 rounded-lg bg-white/[0.045]" />
        <div className="h-56 rounded-2xl border border-[var(--hairline)] bg-white/[0.02]" />
      </div>
    </div>
  );
}
