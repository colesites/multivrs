import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

// Placeholder quote and people — replace with a real, approved customer
// story before launch.
const AVATARS = [
  { initials: "AO", className: "bg-brand-600 text-white" },
  { initials: "MK", className: "bg-emerald-200 text-emerald-900" },
  { initials: "JL", className: "bg-amber-200 text-amber-900" },
  { initials: "SR", className: "bg-sky-200 text-sky-900" },
  { initials: "TN", className: "bg-ink text-white" },
];

export function Testimonial() {
  return (
    <section
      id="customers"
      aria-labelledby="customers-title"
      className="mx-auto max-w-4xl scroll-mt-24 px-4 py-20 text-center sm:px-6 sm:py-28"
    >
      <SectionHeading
        id="customers-title"
        eyebrow="Customers"
        lead="Happy developers,"
        rest="smooth transactions"
      />

      <figure className="reveal mt-12">
        <blockquote className="mx-auto max-w-3xl text-[clamp(1.25rem,2.6vw,1.75rem)] leading-[1.45] font-light tracking-[-0.02em] text-balance text-ink">
          “We replaced three regional payment providers with VRS Pay in a
          weekend. Checkout converts better in every market we sell to, and{" "}
          <span className="font-display text-[1.12em] text-brand-600">
            the webhooks just work
          </span>
          .”
        </blockquote>
        <figcaption className="mt-8 flex items-center justify-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-[13px] font-medium text-white ring-4 ring-brand-100">
            AO
          </span>
          <span className="text-left">
            <span className="block text-[15px] font-medium text-ink">
              Ada Okafor
            </span>
            <span className="block text-[13px] text-mute">CTO, Northwind</span>
          </span>
        </figcaption>
      </figure>

      <div className="reveal mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="flex -space-x-2" aria-hidden="true">
          {AVATARS.map((a) => (
            <span
              key={a.initials}
              className={`grid size-9 place-items-center rounded-full text-[11px] font-medium ring-[3px] ring-white ${a.className}`}
            >
              {a.initials}
            </span>
          ))}
        </div>
        <p className="text-[14px] text-mute">
          Join thousands of teams shipping on VRS Pay
        </p>
        <Button asChild className="h-10 rounded-full px-5">
          <a href="/sign-up">
            Join them <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  );
}
