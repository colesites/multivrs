"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readableError, requestOk } from "@/lib/api/request.client";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import { accountProfileResponseSchema } from "@/lib/schemas/account.schemas";

export function AccountProfileForm({
  initialProfile,
}: {
  initialProfile: AccountProfile;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [busy, setBusy] = useState(false);

  function save() {
    if (busy) return;
    setBusy(true);
    void requestOk(
      "/api/account/profile",
      {
        body: JSON.stringify({
          image: profile.image,
          name: profile.name,
          username: profile.username,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      },
      "Profile update failed",
    )
      .then((response) => response.json())
      .then((body) => accountProfileResponseSchema.parse(body))
      .then((updated) => {
        setProfile(updated);
        toast.success("Profile saved");
        if (updated.username !== initialProfile.username)
          router.replace(`/${updated.username}/~/settings`);
        router.refresh();
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Profile update failed")),
      )
      .finally(() => setBusy(false));
  }

  return (
    <section className="border-y border-[var(--hairline)] py-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account identity and dashboard URL.
        </p>
      </div>
      <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
        <label
          htmlFor="profile-name"
          className="space-y-2 text-xs text-muted-foreground"
        >
          <span>Display name</span>
          <Input
            id="profile-name"
            value={profile.name}
            onChange={(event) =>
              setProfile({ ...profile, name: event.target.value })
            }
          />
        </label>
        <label
          htmlFor="profile-username"
          className="space-y-2 text-xs text-muted-foreground"
        >
          <span>Username</span>
          <Input
            id="profile-username"
            value={profile.username}
            onChange={(event) =>
              setProfile({
                ...profile,
                username: event.target.value.toLowerCase(),
              })
            }
          />
        </label>
        <label
          htmlFor="profile-email"
          className="space-y-2 text-xs text-muted-foreground sm:col-span-2"
        >
          <span>Email</span>
          <Input id="profile-email" value={profile.email} readOnly disabled />
        </label>
        <label
          htmlFor="profile-image"
          className="space-y-2 text-xs text-muted-foreground sm:col-span-2"
        >
          <span>Avatar URL</span>
          <Input
            id="profile-image"
            value={profile.image ?? ""}
            onChange={(event) =>
              setProfile({ ...profile, image: event.target.value || null })
            }
            placeholder="https://…"
          />
        </label>
      </div>
      <Button
        className="mt-5"
        onClick={save}
        disabled={busy || !profile.name.trim() || !profile.username.trim()}
      >
        {busy ? "Saving…" : "Save profile"}
      </Button>
    </section>
  );
}
