import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../badge";
import { useApi, useDashboard } from "../context";
import type { AccountSetup, StepId } from "../types";
import { Button, Card, ErrorNote, Loading, PageHeader } from "../ui";
import { BusinessSection } from "./setup-business";
import {
  AboutSection,
  IdentitySection,
  PayoutSection,
  ProductSection,
} from "./setup-sections";

const NEEDED: Record<StepId, string> = {
  product: "your first product",
  identity: "an ID check",
  business: "your business details",
  payout: "a payout account",
  description: "what you sell",
  website: "your website",
  support_email: "a support email",
};

const STATUS = {
  active: {
    badge: "active",
    text: "Setup is done. Switch to live mode to take real payments; test mode stays for trying things out.",
    icon: <CheckCircle2 className="size-5 text-emerald-600" />,
  },
  setup: {
    badge: "setting_up",
    text: "Test payments work now. Finish the sections below and your account goes live by itself. There's no review to wait for.",
    icon: <ShieldAlert className="size-5 text-amber-600" />,
  },
  restricted: {
    badge: "on_hold",
    text: "Live payments and payouts are paused.",
    icon: <ShieldAlert className="size-5 text-red-600" />,
  },
};

function StatusCard({ setup }: { setup: AccountSetup }) {
  const { session, switchTo } = useDashboard();
  const { badge, icon, ...status } = STATUS[setup.status];
  const live = setup.status === "active" && session.mode === "live";
  const text = live
    ? "You're live. Real payments and payouts are on."
    : status.text;
  const missing = setup.steps.filter((s) => !s.done).map((s) => NEEDED[s.id]);
  return (
    <Card className="flex items-start gap-3">
      {icon}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink">Account status</p>
          <Badge status={badge} />
          <span className="text-xs text-mute">
            {setup.completed} of {setup.total} done
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {setup.status === "restricted" &&
            `On hold: ${setup.hold_reason ?? "contact support"}. `}
          {text}
        </p>
        {missing.length > 0 && setup.status === "setup" && (
          <p className="mt-1 text-xs text-mute">
            Still needed: {missing.join(", ")}.
          </p>
        )}
      </div>
      {setup.status === "active" && session.mode === "test" && (
        <Button onClick={() => switchTo({ mode: "live" })}>
          Switch to live mode
        </Button>
      )}
    </Card>
  );
}

export function SetupView() {
  const { refreshSession } = useDashboard();
  const { data, error, reload } = useApi<AccountSetup>("/setup");
  const [setup, setSetup] = useState<AccountSetup | null>(null);
  useEffect(() => {
    if (data) setSetup(data);
  }, [data]);

  const saved = (next: AccountSetup) => {
    setSetup(next);
    void refreshSession();
  };
  const productCreated = () => {
    reload();
    void refreshSession();
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Set up"
        title="your business"
        description="A few details so we can keep payments safe and pay you anywhere in the world. Your details are never shared with your customers."
      />
      {error && <ErrorNote message={error} />}
      {!setup && !error && <Loading />}
      {setup && (
        <>
          <StatusCard setup={setup} />
          <ProductSection setup={setup} onCreated={productCreated} />
          <IdentitySection setup={setup} onSaved={saved} />
          <BusinessSection setup={setup} onSaved={saved} />
          <PayoutSection setup={setup} onSaved={saved} />
          <AboutSection setup={setup} onSaved={saved} />
        </>
      )}
    </div>
  );
}
