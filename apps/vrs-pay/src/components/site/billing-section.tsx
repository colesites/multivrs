import { BillingShowcase } from "./billing-showcase";
import { SectionHeading } from "./section-heading";

export function BillingSection() {
  return (
    <section
      id="billing"
      aria-labelledby="billing-title"
      className="relative scroll-mt-24 overflow-x-clip py-20 sm:py-28 border-t border-line/60 bg-gradient-to-b from-wash/40 via-white to-white"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="billing-title"
          eyebrow="Billing SDK"
          lead="Drop-in pricing table."
          rest="Live in minutes."
        >
          Drop in a ready-made, high-converting Pricing Table or complete Feature
          Comparison Matrix with a single React component. Fully customizable with
          appearance tokens, Tailwind classes, or custom render slots.
        </SectionHeading>

        <div className="mt-12 sm:mt-16">
          <BillingShowcase />
        </div>
      </div>
    </section>
  );
}
