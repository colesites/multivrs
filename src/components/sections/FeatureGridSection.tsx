import {
  FEATURE_SYSTEM,
  PERFORMANCE_METRICS,
} from "@/components/sections/home.data";

export function FeatureGridSection() {
  return (
    <section className="border-t border-white/10 bg-[#04060b] px-6 py-18 sm:py-22 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h2 className="font-clash text-4xl leading-tight text-white sm:text-5xl">
            Platform features designed for modern software teams
          </h2>
          <p className="mt-4 max-w-2xl font-acari text-white/65">
            Task 3 feature names are now part of the product language and mapped
            to clear capabilities.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURE_SYSTEM.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/3 p-5"
              >
                <h3 className="font-clash text-xl text-white">{feature.title}</h3>
                <p className="mt-2 font-acari text-sm text-white/65">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside id="performance" className="rounded-3xl border border-white/10 bg-white/4 p-6">
          <h3 className="font-clash text-2xl text-white">Performance metrics</h3>
          <p className="mt-2 font-acari text-sm text-white/60">
            Live operations signals across deployment and edge delivery.
          </p>
          <dl className="mt-6 space-y-4">
            {PERFORMANCE_METRICS.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <dt className="font-acari text-xs uppercase tracking-[0.18em] text-white/45">
                  {metric.label}
                </dt>
                <dd className="mt-2 font-clash text-2xl text-white">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
