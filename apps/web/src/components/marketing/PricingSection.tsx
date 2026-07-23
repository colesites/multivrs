"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock,
  Coins,
  GitBranch,
  GitPullRequest,
  Globe,
  Headphones,
  KeyRound,
  Puzzle,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CursorGrid from "@/components/CursorGrid";
import SpecularButton from "@/components/SpecularButton";
import { authClient } from "@/lib/auth-client";

const HOBBY_FEATURES = [
  { text: "Import your repo, deploy in seconds", icon: GitBranch },
  { text: "Automatic CI/CD", icon: GitPullRequest },
  { text: "Web Application Firewall", icon: ShieldCheck },
  { text: "Global, automated CDN", icon: Globe },
  { text: "Fluid compute", icon: Zap },
  { text: "DDoS Mitigation", icon: ShieldAlert },
  { text: "Traffic & performance insights", icon: BarChart3 },
];

const PRO_FEATURES = [
  { text: "$20 of included usage credit", icon: Coins },
  { text: "Advanced spend management", icon: Sliders },
  { text: "Team collaboration & free viewer seats", icon: Users },
  { text: "Faster builds + no queues", icon: Zap },
  { text: "Cold start prevention", icon: Clock },
  { text: "Enterprise add-ons", icon: Puzzle },
];

const ENTERPRISE_FEATURES = [
  { text: "Guest & Team access controls", icon: UserCheck },
  { text: "SCIM & Directory Sync", icon: KeyRound },
  { text: "Managed WAF Rulesets", icon: ShieldAlert },
  { text: "Multi-region compute & failover", icon: Server },
  { text: "99.99% SLA", icon: CheckCircle2 },
  { text: "Advanced Support", icon: Headphones },
];

export function PricingSection() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isSignedIn = !!session?.user;
  const username = session?.user?.username;
  const proTargetHref = isSignedIn ? (username ? `/${username}` : "/") : "/signup";

  return (
    <section className="relative min-h-screen w-full bg-[#030303] text-foreground pt-28 pb-24 lg:pt-36 lg:pb-32 overflow-hidden">
      {/* Interactive ReactBits CursorGrid Background (Brand Blue) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <CursorGrid
          cellSize={65}
          color="#2563eb"
          radius={160}
          falloff="smooth"
          holdTime={400}
          fadeDuration={700}
          lineWidth={1}
          maxOpacity={0.6}
          gridOpacity={0.06}
          className="pointer-events-auto"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        {/* Modern Sans Heading (Inter/Grotesk matching Vercel UI) */}
        <div className="mb-12 lg:mb-16 max-w-3xl">
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-[3.25rem] font-medium tracking-tight text-white leading-[1.12]">
            Build beyond limits,
            <br />
            control your costs
          </h1>
        </div>

        {/* 3 Tier Pricing Cards Container (Sharp rectangular borders like Vercel) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border border-white/15 bg-black/90 divide-y lg:divide-y-0 lg:divide-x divide-white/15 shadow-2xl">
          {/* 1. Hobby Tier */}
          <div className="p-8 lg:p-10 flex flex-col justify-between relative bg-white/[0.005]">
            <div>
              {/* Header section with explicit min-height to ensure HR alignment */}
              <div className="min-h-[140px] flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-sm font-medium text-white/90">
                    Hobby
                  </h3>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-5xl font-normal tracking-tight text-white">
                      $0
                    </span>
                    <span className="font-mono text-xs text-white/40">/mo.</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    The perfect starting place for your web app or personal project.
                  </p>
                </div>
              </div>

              {/* Aligned Divider HR */}
              <div className="my-6 border-t border-white/15" />

              <ul className="space-y-3.5 text-xs text-white/80">
                {HOBBY_FEATURES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-center gap-3">
                      <Icon className="size-3.5 shrink-0 text-white/60" />
                      <span>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-10 pt-2">
              <SpecularButton
                size="md"
                radius={9999}
                tintOpacity={0}
                baseColor="#1c1c1c"
                lineColor="#ffffff"
                textColor="#ffffff"
                className="w-full justify-center text-xs font-medium"
                onClick={() => router.push("/signup")}
              >
                Start Deploying
              </SpecularButton>
            </div>
          </div>

          {/* 2. Pro Tier (POPULAR) */}
          <div className="p-8 lg:p-10 flex flex-col justify-between relative bg-white/[0.015]">
            <div>
              {/* Header section with explicit min-height to ensure HR alignment */}
              <div className="min-h-[140px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-sm font-medium text-white/90">
                    Pro
                  </h3>
                  <span className="inline-flex items-center rounded border border-white/40 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/90">
                    Popular
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-5xl font-normal tracking-tight text-white">
                      $20
                    </span>
                    <span className="font-mono text-xs text-white/40">/mo.</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Everything you need to build and scale your app.
                  </p>
                </div>
              </div>

              {/* Aligned Divider HR */}
              <div className="my-6 border-t border-white/15" />

              <p className="mb-3 text-[11px] font-sans font-medium tracking-wide text-white/50">
                All Hobby features, plus:
              </p>
              <ul className="space-y-3.5 text-xs text-white/90">
                {PRO_FEATURES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-center gap-3">
                      <Icon className="size-3.5 shrink-0 text-white/70" />
                      <span>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-10 pt-2">
              <SpecularButton
                size="md"
                radius={9999}
                tint="#ffffff"
                tintOpacity={1}
                baseColor="#ffffff"
                lineColor="#ffffff"
                textColor="#000000"
                className="w-full justify-center text-xs font-semibold"
                onClick={() => router.push(proTargetHref)}
              >
                {isSignedIn ? "Upgrade now" : "Start Deploying"}
              </SpecularButton>
            </div>
          </div>

          {/* 3. Enterprise Tier */}
          <div className="p-8 lg:p-10 flex flex-col justify-between relative bg-white/[0.005]">
            <div>
              {/* Header section with explicit min-height to ensure HR alignment */}
              <div className="min-h-[140px] flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-sm font-medium text-white/90">
                    Enterprise
                  </h3>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-4xl lg:text-[2.75rem] font-normal tracking-tight text-white">
                      Custom
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Critical security, performance, observability, platform SLAs, and support.
                  </p>
                </div>
              </div>

              {/* Aligned Divider HR */}
              <div className="my-6 border-t border-white/15" />

              <p className="mb-3 text-[11px] font-sans font-medium tracking-wide text-white/50">
                All Pro features, plus:
              </p>
              <ul className="space-y-3.5 text-xs text-white/80">
                {ENTERPRISE_FEATURES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-center gap-3">
                      <Icon className="size-3.5 shrink-0 text-white/60" />
                      <span>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-10 pt-2">
              <SpecularButton
                size="md"
                radius={9999}
                tintOpacity={0}
                baseColor="#1c1c1c"
                lineColor="#ffffff"
                textColor="#ffffff"
                className="w-full justify-center text-xs font-medium"
                onClick={() => router.push("/contact/sales")}
              >
                Get a demo
              </SpecularButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
