import { ArrowUpRight, Check, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Image } from "swift-rust/image";
import { Logo } from "@/components/site/logo";
import { hills, unsplashLoader } from "@/lib/photos";

const ACTIVITY = [
  {
    icon: Check,
    title: "Payment succeeded",
    detail: "Pro plan · monthly",
    amount: "£49.00",
  },
  {
    icon: RefreshCw,
    title: "Subscription renewed",
    detail: "Team · 12 seats",
    amount: "₦180,000",
  },
  {
    icon: ArrowUpRight,
    title: "Payout on the way",
    detail: "To your bank",
    amount: "$1,240.00",
  },
];

/** The landscape panel beside the auth forms, echoing the landing hero. */
function BrandPanel() {
  return (
    <aside className="relative hidden p-3 lg:block">
      <div className="relative isolate flex h-full flex-col justify-between overflow-hidden rounded-[32px] bg-[#8fb6e3] p-10 text-white">
        <Image
          src={hills.src}
          alt=""
          width={hills.width}
          height={hills.height}
          placeholder="blur"
          blurDataURL={hills.blurDataURL}
          loader={unsplashLoader}
          quality={70}
          sizes="50vw"
          className="absolute inset-0 -z-20 size-full object-cover object-[50%_62%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(24_42_92/0.5)_0%,rgb(24_42_92/0.15)_45%,rgb(24_42_92/0.55)_100%)]"
        />
        <p className="eyebrow text-white/80">
          Payments infrastructure for developers
        </p>
        <div>
          <ul className="grid max-w-sm gap-3">
            {ACTIVITY.map(({ icon: Icon, title, detail, amount }) => (
              <li
                key={title}
                className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-ink shadow-[0_20px_40px_-20px_rgb(20_30_70/0.5)] backdrop-blur"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-mute">{detail}</span>
                </span>
                <span className="font-mono text-sm">{amount}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-10 text-[clamp(2.4rem,3.6vw,3.6rem)] leading-[0.95] font-light tracking-[-0.045em] [text-shadow:0_2px_30px_rgb(20_30_70/0.3)]">
            <span className="font-display block text-[1.1em] tracking-[-0.02em]">
              Payment integration
            </span>
            across every border
          </h2>
        </div>
      </div>
    </aside>
  );
}

/** Two-column auth layout: the form on the left, the brand panel on the right. */
export function AuthShell({
  eyebrow,
  serif,
  title,
  subtitle,
  footer,
  children,
}: {
  eyebrow: string;
  serif: string;
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <main className="flex flex-col px-5 py-6 sm:px-10">
        <a href="/" aria-label="VRS Pay home" className="w-fit">
          <Logo />
        </a>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="eyebrow text-brand-600">{eyebrow}</p>
          <h1 className="mt-3 text-[2.6rem] leading-[0.98] font-light tracking-[-0.045em] text-ink">
            <span className="font-display text-[1.1em] tracking-[-0.02em]">
              {serif}
            </span>{" "}
            {title}
          </h1>
          <p className="mt-3 text-[15px] text-mute">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-mute">{footer}</p>
        </div>
        <p className="text-xs text-mute">
          Test mode is free forever. No card needed to start.
        </p>
      </main>
      <BrandPanel />
    </div>
  );
}
