import { ArrowLeftRight, ArrowRight, Check, ChevronDown } from "lucide-react";
import { Image } from "swift-rust/image";
import { customer, hills, unsplashLoader } from "@/lib/photos";
import { Flag } from "./flag";
import { SiteNav } from "./site-nav";

export function Hero() {
  return (
    <section className="px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="relative isolate overflow-hidden rounded-[24px] bg-[#8fb6e3] sm:rounded-[36px]">
        <Image
          src={hills.src}
          alt=""
          width={hills.width}
          height={hills.height}
          placeholder="blur"
          blurDataURL={hills.blurDataURL}
          loader={unsplashLoader}
          quality={72}
          sizes="100vw"
          priority
          className="absolute inset-0 -z-20 size-full object-cover object-[50%_62%]"
        />
        {/* Sky tint keeps white type legible; the haze melts the hills into the page. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(24_42_92/0.42)_0%,rgb(24_42_92/0.16)_34%,rgb(24_42_92/0)_52%,rgb(255_255_255/0)_72%,rgb(255_255_255/0.7)_100%)]"
        />

        <SiteNav />

        <div className="mx-auto max-w-5xl px-5 pt-14 text-center text-white sm:pt-20 lg:pt-24">
          <p className="eyebrow animate-rise text-white/80 [text-shadow:0_1px_12px_rgb(20_30_70/0.35)]">
            Payments infrastructure for developers
          </p>
          <h1 className="mt-5 text-[clamp(2.75rem,7.4vw,6rem)] leading-[0.94] font-light tracking-[-0.045em] text-balance [text-shadow:0_2px_30px_rgb(20_30_70/0.28)]">
            <span className="font-display block text-[1.1em] tracking-[-0.02em]">
              Payment integration
            </span>
            <span className="block">across every border</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[34rem] animate-rise text-[15px] leading-relaxed text-white/88 [animation-delay:120ms] [text-shadow:0_1px_16px_rgb(20_30_70/0.35)] sm:text-[17px]">
            One API to accept cards, wallets and local payment methods in 135+
            currencies — and settle wherever your business lives. Ship checkout,
            subscriptions and payouts in an afternoon.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap items-center justify-center gap-3 [animation-delay:220ms]">
            <a
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-full bg-white py-2 pr-2 pl-5 text-sm font-medium text-ink shadow-[0_10px_30px_-10px_rgb(11_11_18/0.5)] transition hover:bg-white/92"
            >
              Start building free
              <span className="grid size-7 place-items-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-3.5" />
              </span>
            </a>
            <a
              href="/docs"
              className="inline-flex items-center rounded-full bg-white/14 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/35 ring-inset backdrop-blur-md transition hover:bg-white/22"
            >
              Read the docs
            </a>
          </div>
        </div>

        <HeroCards />
      </div>
    </section>
  );
}

/**
 * The product in three glances: lock an FX rate, get paid, see every balance.
 * Laid out at desktop size and scaled with `zoom` on small screens so the
 * composition never reflows.
 */
function HeroCards() {
  return (
    // Flex centering lets the cluster bleed evenly off both edges on phones.
    <div className="mt-12 flex justify-center sm:mt-16">
      <div
        role="img"
        aria-label="VRS Pay app preview: converting 100 US dollars to euros, a payment received notification, and a multi-currency balance of $16,568.20"
        className="relative flex shrink-0 items-end pb-10 [zoom:0.6] min-[420px]:[zoom:0.7] sm:pb-14 sm:[zoom:0.88] lg:[zoom:1]"
      >
        {/* Convert — outer: tilt + entrance, inner: idle bob (separate animations) */}
        <div className="relative z-10 -mr-5 mb-6 w-[252px] -rotate-[7deg] animate-rise [animation-delay:320ms]">
          <div className="animate-bob [animation-delay:-1.5s]">
            <div className="rounded-[22px] bg-white p-4 text-left text-ink shadow-[0_34px_70px_-24px_rgb(16_24_64/0.6)] ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-medium">
                  <ArrowLeftRight className="size-3.5 text-brand-600" /> Convert
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
                  <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
                  live rate
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-wash p-1.5">
                <CurrencyPill country="us" code="USD" />
                <ArrowRight className="size-3.5 text-mute" />
                <CurrencyPill country="eu" code="EUR" />
              </div>
              <p className="mt-4 text-[30px] leading-none font-medium tracking-[-0.03em] tabular-nums">
                $100.00
              </p>
              <p className="mt-1.5 text-[11px] text-mute">
                Available $12,346.80
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-line px-2.5 py-2 font-mono text-[10.5px] text-ink-soft">
                <span>1 USD = 0.9214 EUR</span>
                <span className="text-mute">€92.14</span>
              </div>
              <div className="mt-3 rounded-full bg-ink py-2.5 text-center text-[12px] font-medium text-white">
                Convert now
              </div>
            </div>
          </div>
        </div>

        {/* Customer moment */}
        <div className="relative z-20 animate-rise [animation-delay:180ms]">
          <div className="relative h-[308px] w-[244px] overflow-hidden rounded-[28px] border-[5px] border-white bg-white shadow-[0_44px_90px_-28px_rgb(16_24_64/0.7)]">
            <Image
              src={customer.src}
              alt=""
              width={customer.width}
              height={customer.height}
              placeholder="blur"
              blurDataURL={customer.blurDataURL}
              loader={unsplashLoader}
              quality={70}
              sizes="244px"
              priority
              className="size-full object-cover object-[50%_30%]"
            />
            <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2 rounded-full bg-white/92 py-1.5 pr-3 pl-1.5 text-left shadow-lg backdrop-blur-md">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="text-[11px] leading-tight font-medium text-ink">
                Payment received
                <span className="block font-mono text-[10px] font-normal whitespace-nowrap text-mute">
                  Berlin · just now
                </span>
              </span>
              <span className="ml-auto font-mono text-[11px] font-medium whitespace-nowrap text-emerald-700 tabular-nums">
                +€2,480
              </span>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="relative z-10 -ml-5 mb-6 w-[252px] rotate-[7deg] animate-rise [animation-delay:440ms]">
          <div className="animate-bob [animation-delay:-4s]">
            <div className="grain overflow-hidden rounded-[22px] bg-brand-600 p-4 text-left text-white shadow-[0_34px_70px_-24px_rgb(42_18_112/0.75)] ring-1 ring-white/10">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-white/80">Balance</span>
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10.5px]">
                  All accounts <ChevronDown className="size-3" />
                </span>
              </div>
              <p className="mt-3 text-[30px] leading-none font-medium tracking-[-0.03em] tabular-nums">
                $16,568<span className="text-white/55">.20</span>
              </p>
              <ul className="mt-4 space-y-2 font-mono text-[10.5px] tabular-nums">
                {BALANCES.map((b) => (
                  <li key={b.code} className="flex items-center gap-2">
                    <Flag
                      country={b.country}
                      className="size-3.5 ring-white/30"
                    />
                    <span className="text-white/75">{b.code}</span>
                    <span className="ml-auto">{b.amount}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] font-medium">
                <span className="rounded-full bg-white py-2 text-center text-brand-700">
                  Add money
                </span>
                <span className="rounded-full bg-white/15 py-2 text-center">
                  Send
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BALANCES = [
  { country: "us", code: "USD", amount: "$9,240.00" },
  { country: "eu", code: "EUR", amount: "€4,105.50" },
  { country: "gb", code: "GBP", amount: "£1,980.12" },
] as const;

function CurrencyPill({
  country,
  code,
}: {
  country: "us" | "eu";
  code: string;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-[12px] font-medium shadow-[0_1px_2px_rgb(11_11_18/0.08)]">
      <Flag country={country} />
      {code}
      <ChevronDown className="size-3 text-mute" />
    </span>
  );
}
