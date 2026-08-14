"use client";

import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { DeployVisual } from "@/components/marketing/services/DeployVisual";
import { DomainVisual } from "@/components/marketing/services/DomainVisual";
import { MailboxVisual } from "@/components/marketing/services/MailboxVisual";
import { ServerlessVisual } from "@/components/marketing/services/ServerlessVisual";
import { SecurityVisual } from "@/components/marketing/services/SecurityVisual";

export type ServiceItem = {
  id: string;
  index: string;
  tabLabel: string;
  title: string;
  desc: string;
  bullets: string[];
  buttonText: string;
};

const SERVICES: ServiceItem[] = [
  {
    id: "deploy-apps",
    index: "01",
    tabLabel: "DEPLOY APPS",
    title: "High-performance cloud deployment engineered for modern teams",
    desc: "Push to git and ship worldwide in seconds. Every commit gets an immutable preview, and production rolls out to the edge automatically with zero configuration.",
    bullets: [
      "Global edge CDN",
      "Automated CI/CD pipelines",
      "Instant zero-downtime rollouts",
      "Native preview environments",
    ],
    buttonText: "DEPLOY APPS",
  },
  {
    id: "custom-domains",
    index: "02",
    tabLabel: "CUSTOM DOMAINS",
    title: "Instant domain registration and DNS management at the edge",
    desc: "Search, purchase, and wire custom apex and subdomains in seconds with automated SSL provisioning, anycast DNS, and DNSSEC protection built in.",
    bullets: [
      "Instant domain search & purchase",
      "Automated TLS / SSL certificates",
      "Anycast DNS with sub-millisecond propagation",
      "Apex & wildcard domain routing",
    ],
    buttonText: "BUY DOMAINS",
  },
  {
    id: "transactional-mailbox",
    index: "03",
    tabLabel: "TRANSACTIONAL MAILBOX",
    title: "Dedicated enterprise transactional email infrastructure",
    desc: "Send and receive authenticated transactional emails directly from your domain with dedicated IP reputation, DKIM, SPF, and DMARC verification.",
    bullets: [
      "Built-in transactional inbox & API",
      "Automatic SPF, DKIM & DMARC setup",
      "High deliverability routing",
      "Real-time telemetry & webhook logs",
    ],
    buttonText: "MAIL ENGINE",
  },
  {
    id: "serverless-infra",
    index: "04",
    tabLabel: "SERVERLESS INFRA",
    title: "Isolated computing primitives that scale from zero to infinity",
    desc: "Run compute workloads on demand without server provisioning. Auto-scaling, distributed key-value storage, and isolated memory boundaries out of the box.",
    bullets: [
      "Sub-millisecond cold starts",
      "Scale-to-zero compute",
      "Encrypted KV & blob storage",
      "Real-time observability & telemetry",
    ],
    buttonText: "COMPUTE ENGINE",
  },
  {
    id: "global-edge-network",
    index: "05",
    tabLabel: "EDGE NETWORK & SECURITY",
    title: "Autonomous edge security and DDoS mitigation on every request",
    desc: "Enterprise-grade web application firewall, bot management, and intelligent traffic routing operating across 300+ edge locations globally.",
    bullets: [
      "Next-gen Web Application Firewall",
      "Layer 3/4/7 DDoS mitigation",
      "Automated bot classification",
      "Global edge caching",
    ],
    buttonText: "EDGE SECURITY",
  },
];

function DotMatrixCanvas({ isLight = false, className = "" }: { isLight?: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const pointer = { x: -1000, y: -1000, active: false };
    const spacing = 12;

    type Dot = {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
    };

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;

    const buildGrid = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width || 300;
      height = rect?.height || 400;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      dots = [];
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing + spacing / 2;
          const y = r * spacing + spacing / 2;
          dots.push({
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    buildGrid();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const handleMouseLeave = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const parent = canvas.parentElement || window;
    parent.addEventListener("mousemove", handleMouseMove as EventListener);
    parent.addEventListener("mouseleave", handleMouseLeave as EventListener);
    window.addEventListener("resize", buildGrid);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const maxDist = 70;
      const forceMultiplier = 0.22;
      const spring = 0.08;
      const friction = 0.84;

      ctx.fillStyle = isLight ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.65)";

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]!;

        if (pointer.active) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * forceMultiplier;
            dot.vx += (dx / dist) * force * 15;
            dot.vy += (dy / dist) * force * 15;
          }
        }

        const homeX = dot.baseX - dot.x;
        const homeY = dot.baseY - dot.y;
        dot.vx += homeX * spring;
        dot.vy += homeY * spring;

        dot.vx *= friction;
        dot.vy *= friction;

        dot.x += dot.vx;
        dot.y += dot.vy;

        ctx.fillRect(dot.x - 0.75, dot.y - 0.75, 1.5, 1.5);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      parent.removeEventListener("mousemove", handleMouseMove as EventListener);
      parent.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      window.removeEventListener("resize", buildGrid);
    };
  }, [isLight]);

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}

function getServiceHref(serviceId: string, user: unknown): string {
  if (serviceId === "deploy-apps") {
    return user ? "/deploy" : "/signup";
  }
  if (serviceId === "custom-domains") {
    return user ? "/domains" : "/domains/search";
  }
  if (serviceId === "transactional-mailbox") {
    return user ? "/mail" : "/emails";
  }
  if (serviceId === "serverless-infra") {
    return "/compute";
  }
  if (serviceId === "global-edge-network") {
    return "/security";
  }
  return user ? "/dashboard" : "/signup";
}

export function Services() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  const renderVisual = (id: string) => {
    switch (id) {
      case "deploy-apps":
        return <DeployVisual />;
      case "custom-domains":
        return <DomainVisual />;
      case "transactional-mailbox":
        return <MailboxVisual />;
      case "serverless-infra":
        return <ServerlessVisual />;
      case "global-edge-network":
        return <SecurityVisual />;
      default:
        return <DeployVisual />;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isDesktop = window.innerWidth >= 1024;
      const refs = isDesktop ? itemRefs.current : mobileItemRefs.current;
      const windowCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      refs.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elCenter - windowCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      setActiveIndex(closestIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    const targetEl = itemRefs.current[index];
    if (targetEl && window.innerWidth >= 1024) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleMobileTabClick = (index: number) => {
    setActiveIndex(index);
    const targetEl = mobileItemRefs.current[index];
    if (targetEl) {
      const topOffset = targetEl.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: topOffset, behavior: "instant" });
    }
  };

  const activeService = SERVICES[activeIndex] ?? SERVICES[0]!;

  return (
    <section id="services" className="relative w-full bg-background text-foreground py-20 lg:py-32 overflow-x-clip transition-colors duration-500">
      <div className="w-full max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-20 xl:px-28">
        <div className="mb-14 lg:mb-28">
          <h2 className="font-sans text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-medium tracking-tight text-foreground leading-[1.04] text-left">
            One platform for
            <br />
            every layer of the stack.
          </h2>
        </div>

        <div className="block lg:hidden">
          <div
            data-lenis-prevent="true"
            data-lenis-prevent-touch="true"
            className="sticky top-16 z-30 -mx-6 px-6 sm:-mx-12 sm:px-12 w-[calc(100%+3rem)] sm:w-[calc(100%+6rem)] bg-background/95 backdrop-blur-md py-4 sm:py-5 mb-14 border-b border-border select-none transition-colors"
          >
            <div
              data-lenis-prevent="true"
              data-lenis-prevent-touch="true"
              className="flex items-center gap-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
              style={{
                touchAction: "pan-x",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {SERVICES.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleMobileTabClick(index)}
                    className="flex items-center gap-3 shrink-0 py-1.5 transition-colors cursor-pointer"
                  >
                    <span
                      className={`flex h-7 w-8 sm:h-8 sm:w-9 items-center justify-center font-mono text-xs select-none transition-colors ${
                        isActive
                          ? "bg-foreground font-bold text-background shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      {service.index}
                    </span>
                    <span
                      className={`font-mono text-xs tracking-wider uppercase whitespace-nowrap transition-colors ${
                        isActive
                          ? "text-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {service.tabLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-28">
            {SERVICES.map((service, index) => (
              <div
                key={service.id}
                ref={(el) => {
                  mobileItemRefs.current[index] = el;
                }}
                className="flex flex-col scroll-mt-32"
              >
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground leading-snug mb-3">
                  {service.title}
                </h3>

                <p className="font-sans text-sm sm:text-base leading-relaxed text-muted-foreground mb-5">
                  {service.desc}
                </p>

                <ul className="space-y-2 mb-6 text-xs sm:text-sm text-foreground/90 font-normal">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2.5">
                      <span className="text-foreground">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <Link
                    href={getServiceHref(service.id, user)}
                    className="inline-flex w-fit items-center rounded-full border border-foreground px-4 py-1.5 font-mono text-xs tracking-widest text-foreground uppercase hover:bg-foreground hover:text-background transition-colors"
                  >
                    {service.buttonText}
                  </Link>
                </div>

                <div className="relative w-full my-6">
                  {renderVisual(service.id)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-12 gap-10 items-start relative">
          
          <div className="col-span-3 sticky top-28 flex flex-col justify-start h-[calc(100vh-9rem)]">
            <nav
              className="relative z-10 flex flex-col space-y-7 shrink-0 bg-background pb-8 transition-colors"
              aria-label="Services navigation"
            >
              {SERVICES.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleTabClick(index)}
                    className="group flex items-center gap-4 text-left transition-colors cursor-pointer"
                  >
                    {isActive ? (
                      <span className="flex h-8 w-9 items-center justify-center bg-foreground font-mono text-sm font-bold text-background select-none transition-colors">
                        {service.index}
                      </span>
                    ) : (
                      <span className="flex h-8 w-9 items-center justify-center font-mono text-sm text-muted-foreground group-hover:text-foreground select-none transition-colors">
                        {service.index}
                      </span>
                    )}
                    <span
                      className={`font-mono text-sm tracking-wider uppercase transition-colors ${
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {service.tabLabel}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="flex-1 w-full min-h-[200px] overflow-hidden relative">
              <DotMatrixCanvas isLight={isLight} className="h-full w-full" />
            </div>
          </div>

          <div className="col-span-4 flex flex-col">
            {SERVICES.map((service, index) => (
              <div
                key={service.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="min-h-screen flex flex-col justify-start pt-2 pb-32 scroll-mt-28 max-w-md"
              >
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground leading-snug mb-4">
                  {service.title}
                </h3>

                <p className="font-sans text-sm sm:text-base leading-relaxed text-muted-foreground mb-6">
                  {service.desc}
                </p>

                <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-foreground/90 font-normal">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2.5 text-foreground">
                      <span className="text-foreground">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={getServiceHref(service.id, user)}
                  className="inline-flex w-fit items-center rounded-full border border-foreground px-4 py-1 font-mono text-[11px] tracking-widest text-foreground uppercase hover:bg-foreground hover:text-background transition-colors"
                >
                  {service.buttonText}
                </Link>
              </div>
            ))}
          </div>

          <div className="col-span-5 sticky top-28 pointer-events-auto">
            <div className="relative flex h-[calc(100vh-9rem)] w-full items-start justify-start">
              <div className="w-full transition-all duration-300">
                {renderVisual(activeService.id)}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
