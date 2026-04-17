import { Button } from "@/components/ui/button";
import { PRICING_PREVIEW } from "@/components/sections/home.data";

export function PricingPreviewSection() {
  return (
    <section id="pricing" className="border-t border-white/10 bg-[#04060a] px-6 py-18 sm:py-22 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="font-clash text-4xl text-white sm:text-5xl">Pricing that scales with your product</h2>
        <p className="mt-4 max-w-3xl font-acari text-white/65">
          Start with free environments, move to Pro as your workloads grow, and
          unlock Business governance when operations become mission-critical.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PRICING_PREVIEW.map((plan) => (
            <article
              key={plan.title}
              className="rounded-3xl border border-white/10 bg-white/4 p-7"
            >
              <h3 className="font-clash text-2xl text-white">{plan.title}</h3>
              <p className="mt-2 font-acari text-sm text-white/60">{plan.description}</p>
              <p className="mt-6 font-clash text-4xl text-white">{plan.price}</p>
              <Button className="mt-6 w-full rounded-full bg-white text-black hover:bg-white/90">
                {plan.cta}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
