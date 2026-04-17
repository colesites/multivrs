import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ECOSYSTEM_PRODUCTS,
  ECOSYSTEM_STATS,
} from "@/components/sections/ecosystem.data";

export function EcosystemSection() {
  return (
    <section
      id="products"
      className="relative overflow-hidden border-t border-white/10 bg-[#040409] px-6 py-20 sm:py-24 lg:px-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_30%_20%,rgba(59,130,246,0.2),transparent_65%),radial-gradient(ellipse_50%_40%_at_85%_25%,rgba(14,165,233,0.2),transparent_70%)]"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="border-white/15 bg-white/5 px-4 py-1 text-[11px] uppercase tracking-[0.22em] text-white/70"
            >
              Platform Ecosystem
            </Badge>
            <h2 className="mt-5 font-clash text-4xl leading-tight tracking-tight text-white sm:text-5xl">
              One architecture.
              <span className="bg-linear-to-r from-white via-[#c9defc] to-[#d7f0ff] bg-clip-text text-transparent">
                {" "}
                Multiple universes.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl font-acari text-base leading-relaxed text-white/65 sm:text-lg">
              Multivrs connects deployment, developer tooling, AI workflows,
              and reusable interface systems into a single operating model.
            </p>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="w-fit rounded-full border-white/20 bg-white/5 px-7 text-white/90 backdrop-blur-lg transition-colors hover:bg-white/10"
          >
            View Product Architecture
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {ECOSYSTEM_STATS.map((stat) => (
            <article
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-[0_24px_80px_rgba(7,6,18,0.45)] backdrop-blur-xl"
            >
              <p className="font-clash text-3xl font-semibold text-white">
                {stat.value}
              </p>
              <p className="mt-2 font-acari text-sm text-white/60">
                {stat.label}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {ECOSYSTEM_PRODUCTS.map((product) => (
            <article
              key={product.name}
              className="group rounded-3xl border border-white/10 bg-linear-to-br from-white/8 via-white/3 to-transparent p-7 transition-colors hover:border-white/20"
            >
              <p className="font-acari text-xs uppercase tracking-[0.2em] text-white/45">
                {product.category}
              </p>
              <h3 className="mt-3 font-clash text-2xl text-white">
                {product.name}
              </h3>
              <p className="mt-3 max-w-[46ch] font-acari text-sm leading-relaxed text-white/65">
                {product.description}
              </p>
              <div className="mt-5 h-px w-full bg-linear-to-r from-sky-300/50 via-blue-300/40 to-transparent opacity-65 transition-opacity group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
