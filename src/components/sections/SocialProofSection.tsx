import { Badge } from "@/components/ui/badge";
import { SOCIAL_PROOF, WHY_MULTIVRS } from "@/components/sections/home.data";

export function SocialProofSection() {
  return (
    <section className="border-t border-white/10 bg-[#04070f] px-6 py-18 sm:py-20 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div>
          <p className="mb-4 font-acari text-xs uppercase tracking-[0.22em] text-white/45">
            Trusted by ambitious product teams
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {SOCIAL_PROOF.map((brand) => (
              <div
                key={brand}
                className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-center font-clash text-sm text-white/75"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>

        <div id="why-multivrs" className="grid gap-4 md:grid-cols-3">
          {WHY_MULTIVRS.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/3 p-6"
            >
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">
                Why Multivrs
              </Badge>
              <h3 className="mt-4 font-clash text-2xl text-white">{item.title}</h3>
              <p className="mt-3 font-acari text-sm leading-relaxed text-white/65">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
