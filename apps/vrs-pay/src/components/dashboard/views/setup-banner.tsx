import { Radio, ShieldAlert } from "lucide-react";
import { useDashboard } from "../context";
import { Button, Card } from "../ui";

/** On the overview: how far setup is, then a nudge to go live once it's done. */
export function SetupBanner() {
  const { session, navigate, switchTo } = useDashboard();
  const { status, completed, total } = session.setup;
  if (status === "active") {
    if (session.mode === "live") return null;
    return (
      <Card className="flex flex-wrap items-center gap-3">
        <Radio className="size-5 text-emerald-600" />
        <p className="min-w-0 flex-1 text-sm text-ink-soft">
          Setup is done. You can take real payments now.
        </p>
        <Button onClick={() => switchTo({ mode: "live" })}>
          Switch to live mode
        </Button>
      </Card>
    );
  }
  const onHold = status === "restricted";
  return (
    <Card className="flex flex-wrap items-center gap-3">
      <ShieldAlert
        className={`size-5 ${onHold ? "text-red-600" : "text-amber-600"}`}
      />
      <p className="min-w-0 flex-1 text-sm text-ink-soft">
        {onHold
          ? "Your account is on hold. Live payments and payouts are paused."
          : `Test payments work now. Finish setting up to go live (${completed} of ${total} done).`}
      </p>
      <Button onClick={() => navigate("setup")}>
        {onHold ? "See why" : "Finish setup"}
      </Button>
    </Card>
  );
}
