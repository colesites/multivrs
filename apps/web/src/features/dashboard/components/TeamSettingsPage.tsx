"use client";

import { Check, Copy, Upload, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import {
  SettingsNav,
  type SettingsSection,
} from "@/features/dashboard/components/SettingsNav";
import { TeamManager } from "@/features/dashboard/components/TeamManager";
import { BillingManager } from "@/features/dashboard/components/BillingManager";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import type { AccountTeam } from "@/lib/services/account-team.service";

const SECTIONS: SettingsSection[] = [
  { id: "general", label: "General" },
  { id: "members", label: "Members" },
  { id: "billing", label: "Billing" },
];

interface TeamSettingsPageProps {
  initialTeam: AccountTeam;
  billing: BillingOverview;
  username: string;
}

export function TeamSettingsPage({
  initialTeam,
  billing,
  username,
}: TeamSettingsPageProps) {
  const [team, setTeam] = useState(initialTeam);
  const [name, setName] = useState(initialTeam.name);
  const [slug, setSlug] = useState(initialTeam.slug);
  const [savingName, setSavingName] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const saveName = async () => {
    if (!name.trim() || savingName) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update team name");
      }
      const updated = await res.json();
      setTeam((t) => ({ ...t, name: updated.name }));
      toast.success("Team name updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update team name");
    } finally {
      setSavingName(false);
    }
  };

  const saveSlug = async () => {
    if (!slug.trim() || savingSlug) return;
    setSavingSlug(true);
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update team URL");
      }
      const updated = await res.json();
      setTeam((t) => ({ ...t, slug: updated.slug }));
      toast.success("Team URL updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update team URL");
    } finally {
      setSavingSlug(false);
    }
  };

  const copyTeamId = async () => {
    await navigator.clipboard.writeText(team.id);
    setCopiedId(true);
    toast.success("Team ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="w-full px-5 py-6">
      <DashboardPageHeader
        title="Team Settings"
        description="Manage your team name, URL namespace, collaborators, and billing."
      />
      <div className="mt-6 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
        <SettingsNav sections={SECTIONS} />
        <div className="min-w-0 max-w-4xl space-y-10">
          {/* General Section */}
          <section id="general" className="scroll-mt-6 space-y-6">
            {/* Team Name Card */}
            <SettingsCard>
              <SettingsCardBody
                title="Team Name"
                description="This is your team's visible name within Multivrs. For example, the name of your company or department."
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={32}
                  className="max-w-md font-sans text-sm"
                  placeholder="Acme Corp"
                />
              </SettingsCardBody>
              <SettingsCardFooter
                helperText="Please use 32 characters at maximum."
                action={
                  <Button
                    size="sm"
                    disabled={savingName || name === team.name || !name.trim()}
                    onClick={saveName}
                  >
                    {savingName ? "Saving…" : "Save"}
                  </Button>
                }
              />
            </SettingsCard>

            {/* Team URL Card */}
            <SettingsCard>
              <SettingsCardBody
                title="Team URL"
                description="This is your team's URL namespace on Multivrs. Within it, your team can inspect their projects, check out recent activity, or configure settings."
              >
                <div className="flex max-w-md items-center rounded-md border border-input bg-transparent shadow-xs focus-within:ring-1 focus-within:ring-ring">
                  <span className="flex select-none items-center pl-3 text-xs text-muted-foreground">
                    multivrs.space/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    maxLength={48}
                    className="flex h-9 w-full bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="my-team"
                  />
                </div>
              </SettingsCardBody>
              <SettingsCardFooter
                helperText="Please use 48 characters at maximum."
                action={
                  <Button
                    size="sm"
                    disabled={savingSlug || slug === team.slug || !slug.trim()}
                    onClick={saveSlug}
                  >
                    {savingSlug ? "Saving…" : "Save"}
                  </Button>
                }
              />
            </SettingsCard>

            {/* Team Avatar Card */}
            <SettingsCard>
              <SettingsCardBody
                title="Team Avatar"
                description="This is your team's avatar. Upload a custom logo to easily recognize your team."
              >
                <div className="flex items-center gap-5">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-(--hairline-strong) bg-white/5 font-geist-mono text-xl font-bold text-foreground uppercase">
                    {team.name[0] || "T"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    An avatar is optional but strongly recommended. Square PNG, JPEG, or WebP.
                  </div>
                </div>
              </SettingsCardBody>
              <SettingsCardFooter
                helperText="Square image recommended."
              />
            </SettingsCard>

            {/* Team ID Card */}
            <SettingsCard>
              <SettingsCardBody
                title="Team ID"
                description="This is your team's ID within Multivrs."
              >
                <div className="flex max-w-md items-center gap-2">
                  <Input
                    readOnly
                    value={team.id}
                    className="font-mono text-xs text-muted-foreground bg-black/5 dark:bg-white/5 select-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    onClick={copyTeamId}
                  >
                    {copiedId ? (
                      <>
                        <Check className="size-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </SettingsCardBody>
              <SettingsCardFooter
                helperText="Used when interacting with the Multivrs API."
              />
            </SettingsCard>
          </section>

          {/* Members Section */}
          <section id="members" className="scroll-mt-6 space-y-6">
            <TeamManager />
          </section>

          {/* Billing Section */}
          <section id="billing" className="scroll-mt-6 space-y-6">
            <BillingManager initial={billing} />
          </section>
        </div>
      </div>
    </div>
  );
}
