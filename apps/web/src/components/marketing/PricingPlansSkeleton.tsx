/** Placeholder for the three pricing cards while plan data resolves. */
export function PricingPlansSkeleton() {
  return (
    <section className="relative min-h-screen w-full bg-background pb-24 pt-28 text-foreground lg:pb-32 lg:pt-36">
      <div className="marketing-container">
        <div className="mb-12 max-w-3xl lg:mb-16">
          <div className="h-12 w-2/3 animate-pulse rounded bg-foreground/10" />
          <div className="mt-4 h-12 w-1/2 animate-pulse rounded bg-foreground/5" />
        </div>
        <div className="grid grid-cols-1 divide-y divide-border border border-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {["hobby", "pro", "enterprise"].map((plan) => (
            <div className="flex flex-col gap-6 p-8 lg:p-10" key={plan}>
              <div className="h-5 w-24 animate-pulse rounded bg-foreground/10" />
              <div className="h-12 w-32 animate-pulse rounded bg-foreground/10" />
              <div className="h-4 w-full animate-pulse rounded bg-foreground/5" />
              <div className="mt-6 space-y-3">
                {["a", "b", "c", "d"].map((row) => (
                  <div
                    className="h-4 w-full animate-pulse rounded bg-foreground/5"
                    key={row}
                  />
                ))}
              </div>
              <div className="mt-auto h-11 w-full animate-pulse rounded-full bg-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
