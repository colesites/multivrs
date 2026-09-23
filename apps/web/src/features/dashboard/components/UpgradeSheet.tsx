"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Coins,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { startSubscriptionCheckout } from "@/features/billing/subscription-checkout-api";

interface UpgradeSheetProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    username: string;
  };
  workspaceName: string;
  features?: string[];
  featureDescriptions?: Record<string, string>;
}

interface PaymentInfo {
  hasPaymentMethod: boolean;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  email: string;
}

interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  organizationId?: string | null;
}

const DEFAULT_PRO_CARD_FEATURES = [
  "Spend controls",
  "Team collaboration",
  "Faster builds, no queues",
  "No cold starts",
  "Enterprise add-ons",
];

const DEFAULT_PRO_CARD_DESCRIPTIONS: Record<string, string> = {
  "Spend controls": "Manage budgets, prevent overages, and keep spend predictable",
  "Team collaboration": "Collaborate with your team with role-based member permissions",
  "Faster builds, no queues": "Dedicated build concurrency with zero queuing delays",
  "No cold starts": "Always-warm global edge compute execution",
  "Enterprise add-ons": "Scale with custom domains, dedicated support, and advanced add-ons",
};

export function UpgradeSheet({
  user,
  workspaceName,
  features,
  featureDescriptions,
}: UpgradeSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(2);
  const [hasStep1, setHasStep1] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [organizations, setOrganizations] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);

  const activeWorkspaceName = workspaceName || user.username || "Personal";

  const includedFeatures = useMemo(() => {
    const list =
      features && features.length > 0 ? features : DEFAULT_PRO_CARD_FEATURES;
    return list.map((title) => {
      const desc =
        featureDescriptions?.[`desc:${title}`] ||
        featureDescriptions?.[`desc_${title}`] ||
        featureDescriptions?.[title] ||
        featureDescriptions?.[`desc:${title.toLowerCase()}`] ||
        featureDescriptions?.[title.toLowerCase()] ||
        DEFAULT_PRO_CARD_DESCRIPTIONS[title] ||
        null;
      return { title, description: desc };
    });
  }, [features, featureDescriptions]);

  const personalWorkspace: WorkspaceOption = useMemo(
    () => ({
      id: "personal",
      name: activeWorkspaceName,
      slug: workspaceName || user.username,
      isPersonal: true,
      organizationId: null,
    }),
    [activeWorkspaceName, workspaceName, user.username],
  );

  const workspaces = useMemo<WorkspaceOption[]>(() => {
    const list: WorkspaceOption[] = [personalWorkspace];
    if (organizations && organizations.length > 0) {
      for (const org of organizations) {
        list.push({
          id: org.id,
          name: org.name,
          slug: org.slug,
          isPersonal: false,
          organizationId: org.id,
        });
      }
    }
    return list;
  }, [personalWorkspace, organizations]);

  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceOption>(personalWorkspace);

  // Sync selected workspace when current workspace changes
  useEffect(() => {
    const match = workspaces.find((w) => w.slug === workspaceName);
    if (match) {
      setSelectedWorkspace(match);
    }
  }, [workspaceName, workspaces]);

  // Check URL parameters on mount once via window.location to avoid router re-fetch loops
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const upgradeTeamParam = params.get("upgradeTeam");
    const upgradeParam = params.get("upgrade");

    if (upgradeTeamParam) {
      // Coming from external source like pricing card: show Step 1
      setStep(1);
      setHasStep1(true);
      setIsOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (upgradeParam) {
      // Triggered from inside dashboard: active team is known, skip Step 1
      setStep(2);
      setHasStep1(false);
      setIsOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Listen to custom window event to open from anywhere in the client
  useEffect(() => {
    function handleCustomOpen(event: Event) {
      const customEvent = event as CustomEvent<{ step?: 1 | 2 }>;
      const targetStep = customEvent.detail?.step ?? 2;
      setStep(targetStep);
      setHasStep1(targetStep === 1);
      setIsOpen(true);
    }

    window.addEventListener("open-upgrade-sheet", handleCustomOpen);
    return () => {
      window.removeEventListener("open-upgrade-sheet", handleCustomOpen);
    };
  }, []);

  // Fetch organizations lazily only when sheet is opened in Step 1
  useEffect(() => {
    if (!isOpen || step !== 1) return;

    let active = true;
    fetch("/api/auth/organization/list")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data)) {
          setOrganizations(data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isOpen, step]);

  // Fetch payment method information for Step 2
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    fetch("/api/billing/payment-method")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PaymentInfo | null) => {
        if (active && data) {
          setPaymentInfo(data);
        }
      })
      .catch(() => {
        // Silently fall back
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    setIsUpgrading(false);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  async function handleUpgrade() {
    setIsUpgrading(true);
    try {
      const checkoutUrl = await startSubscriptionCheckout({
        organizationId: selectedWorkspace.organizationId,
        returnSlug: selectedWorkspace.slug,
      });
      window.location.assign(checkoutUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to initiate upgrade",
      );
      setIsUpgrading(false);
    }
  }

  const teamInitial = (selectedWorkspace.name?.[0] ?? "M").toUpperCase();
  const userEmail = paymentInfo?.email || user.email;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-none md:w-230 md:max-w-230 p-0 border-l border-(--hairline) bg-(--ink) text-foreground shadow-2xl overflow-y-auto font-hanken"
      >
        <SheetTitle className="sr-only">Upgrade to Pro</SheetTitle>
        <SheetDescription className="sr-only">
          Upgrade your workspace to the MULTIVRS Pro plan.
        </SheetDescription>

        <div className="flex flex-col md:flex-row min-h-full divide-y md:divide-y-0 md:divide-x divide-(--hairline)">
          {/* Left Column: What's included */}
          <div className="w-full md:w-85 shrink-0 p-6 md:p-8 flex flex-col justify-between bg-black/40">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground mb-1">
                What&apos;s included
              </h2>
              <p className="text-[11.5px] text-muted-foreground/80 mb-5">
                All Hobby features, plus:
              </p>
              <ul className="space-y-4">
                {includedFeatures.map(({ title, description }) => (
                  <li key={title} className="flex items-start gap-3">
                    <div className="size-4 shrink-0 rounded-full flex items-center justify-center text-white/80 mt-0.5">
                      <Check className="size-3.5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-medium text-foreground tracking-[-0.01em]">
                        {title}
                      </span>
                      {description && (
                        <p className="text-muted-foreground/80 mt-0.5 leading-normal text-[11.5px]">
                          {description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 border-t border-(--hairline) mt-8">
              <Link
                href="/pricing"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ExternalLink className="size-3.5 text-muted-foreground/70 group-hover:text-foreground" />
                <span>Learn more about pricing</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Step Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative bg-(--ink) min-w-0 md:min-w-135">
            {/* Back Button (if entered via Step 1) */}
            {hasStep1 && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="absolute top-5 left-5 size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer z-10"
                aria-label="Back to step 1"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            {/* Content Body */}
            <div>
              {/* Header */}
              <div className="flex flex-col items-center text-center pt-2">
                <div className="flex items-center gap-2">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={selectedWorkspace.name}
                      width={28}
                      height={28}
                      unoptimized
                      className="size-7 rounded-full border border-(--hairline-strong) object-cover"
                    />
                  ) : (
                    <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium font-geist-mono">
                      {teamInitial}
                    </span>
                  )}
                  <span className="bg-[#0070f3] text-white text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                    Pro
                  </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground mt-3">
                  Upgrade {selectedWorkspace.name} to Pro
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Unlock collaboration and improved performance.
                </p>
              </div>

              {/* Step 1: Select Team / Workspace (used when arriving from Pricing Page) */}
              {step === 1 && (
                <div className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <span
                      id="team-select-label"
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      Select Team or Workspace
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-labelledby="team-select-label"
                          className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-(--hairline-strong) bg-white/3 text-left hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                              {teamInitial}
                            </span>
                            <span className="text-sm font-medium text-foreground truncate">
                              {selectedWorkspace.name}
                            </span>
                          </div>
                          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[320px] bg-(--ink) border border-(--hairline-strong) text-foreground p-1.5 shadow-xl"
                      >
                        {workspaces.map((w) => (
                          <DropdownMenuItem
                            key={w.id}
                            onClick={() => setSelectedWorkspace(w)}
                            className="flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-lg hover:bg-white/10"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                                {(w.name?.[0] ?? "M").toUpperCase()}
                              </span>
                              <span className="text-xs font-medium text-foreground truncate">
                                {w.name}
                              </span>
                            </div>
                            {selectedWorkspace.id === w.id && (
                              <Check className="size-3.5 text-white" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="rounded-xl border border-(--hairline) bg-white/2 p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pro plan</span>
                      <span className="font-semibold text-foreground font-geist-mono">
                        $20
                        <span className="text-[11px] font-normal text-muted-foreground">
                          /mo
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Included monthly credits
                      </span>
                      <span className="text-emerald-400 font-geist-mono">
                        $20/mo
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/80 pt-2 border-t border-(--hairline)">
                      Your team gets access to higher limits, fast builds,
                      and premium developer workflows.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Confirmation, Payment Method & Cost Breakdown (Matches Vercel design) */}
              {step === 2 && (
                <div className="mt-7 space-y-3.5">
                  {/* Card 1: Included credit */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-(--hairline) bg-white/2 text-xs">
                    <div className="flex items-center gap-3">
                      <Coins className="size-4 text-[#0070f3]" />
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          Included credit
                        </span>
                        <HelpCircle className="size-3 text-muted-foreground/60" />
                      </div>
                    </div>
                    <span className="font-semibold text-[#0070f3] font-geist-mono">
                      $20
                    </span>
                  </div>

                  {/* Card 2: Payment Method card */}
                  <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-(--hairline) bg-white/2 text-xs">
                    <div className="flex items-center gap-3">
                      <CreditCard className="size-4 text-muted-foreground shrink-0" />
                      <div>
                        {paymentInfo?.hasPaymentMethod ? (
                          <>
                            <p className="font-medium text-foreground capitalize">
                              {paymentInfo.brand || "Card"} ending in{" "}
                              {paymentInfo.last4 || "••••"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              exp. {paymentInfo.expMonth || "12"}/
                              {paymentInfo.expYear || "2028"}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-foreground">
                              Payment Method
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Entered securely via Stripe Checkout
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate max-w-50">
                      {userEmail}
                    </span>
                  </div>

                  {/* Table: Product & Cost breakdown */}
                  <div className="pt-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground/70 pb-2 border-b border-(--hairline) text-[11px]">
                      <span>Product</span>
                      <span>Cost</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between text-foreground">
                      <span>Pro</span>
                      <span className="font-geist-mono">$20</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between border-t border-(--hairline) text-foreground">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                        <span>Flat Rate CDN</span>
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </div>
                      <span className="font-geist-mono">$0</span>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground -mt-1 pb-2">
                      1M CDN requests included • Tiers from 10M (+$20/mo.) up to 150M (+$300/mo)
                    </p>

                    <div className="py-2.5 flex items-center justify-between border-t border-(--hairline) text-foreground">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                        <span>1 member</span>
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </div>
                      <span className="font-geist-mono">$0</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between border-t border-(--hairline) text-foreground">
                      <span>Estimated tax</span>
                      <span className="font-geist-mono">$0</span>
                    </div>

                    {/* Total */}
                    <div className="py-3 flex items-center justify-between border-t border-(--hairline) font-semibold text-foreground text-sm">
                      <span>Total</span>
                      <span className="font-geist-mono">$20 / month</span>
                    </div>
                  </div>

                  {/* Legal Terms Disclaimer */}
                  <p className="text-[10.5px] text-muted-foreground/80 leading-relaxed pt-1">
                    You will be charged $20 immediately. Renews monthly in advance
                    at $20 plus your Flat Rate CDN tier and applicable taxes. Flat
                    rate CDN includes protection from unexpected spikes in
                    traffic. If your usage exceeds 1M CDN Requests, you will move
                    to the matching Flat Rate CDN tier at your next billing
                    cycle. Other metered features bill in arrears per pricing.
                    Downgrade or cancel any time in Settings. See terms for more
                    information.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 border-t border-(--hairline) mt-6">
              {step === 1 ? (
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="text-xs h-9 px-4 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs h-9 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all cursor-pointer"
                  >
                    Continue
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Redirecting to Checkout...</span>
                      </>
                    ) : (
                      <span>Upgrade</span>
                    )}
                  </Button>

                  <div className="flex items-center gap-2.5">
                    {hasStep1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          disabled={isUpgrading}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
                        >
                          Back
                        </button>
                        <span className="text-xs text-muted-foreground/30">•</span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isUpgrading}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
