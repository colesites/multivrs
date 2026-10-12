"use client";

import { Upload } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readableError, requestOk } from "@/lib/api/request.client";
import { authClient } from "@/lib/auth-client";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import { accountProfileResponseSchema } from "@/lib/schemas/account.schemas";

const AVATAR_SIZE = 256;

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
    <section className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70">
      <div className="border-b border-(--hairline) px-5 py-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your account identity and dashboard URL.
        </p>
      </div>
      <AvatarField
        profile={profile}
        onChange={(updated) => {
          setProfile({ ...profile, image: updated.image });
          router.refresh();
        }}
      />
      <div className="grid max-w-2xl gap-5 p-5 sm:grid-cols-2">
        <label
          htmlFor="profile-name"
          className="space-y-2 text-xs text-muted-foreground"
        >
          <span>Display name</span>
          <Input
            id="profile-name"
            maxLength={80}
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
            maxLength={30}
            value={profile.username}
            onChange={(event) =>
              setProfile({
                ...profile,
                username: event.target.value.toLowerCase(),
              })
            }
          />
        </label>
        <EmailField email={profile.email} />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-(--hairline) bg-black/2 dark:bg-white/2 px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Your username is your dashboard URL: lowercase letters, numbers, and
          underscores, up to 30 characters.
        </p>
        <Button
          onClick={save}
          disabled={busy || !profile.name.trim() || !profile.username.trim()}
        >
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </section>
  );
}

function AvatarField({
  profile,
  onChange,
}: {
  profile: AccountProfile;
  onChange: (profile: AccountProfile) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function send(request: Promise<Response>, success: string) {
    setBusy(true);
    void request
      .then((response) => response.json())
      .then((body) => accountProfileResponseSchema.parse(body))
      .then((updated) => {
        onChange(updated);
        toast.success(success);
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Avatar update failed")),
      )
      .finally(() => setBusy(false));
  }

  function upload(file: File) {
    send(
      squareImage(file).then((image) => {
        const body = new FormData();
        body.set("file", image);
        return requestOk(
          "/api/account/avatar",
          { body, method: "POST" },
          "Avatar upload failed",
        );
      }),
      "Avatar updated",
    );
  }

  function remove() {
    send(
      requestOk(
        "/api/account/avatar",
        { method: "DELETE" },
        "Avatar could not be removed",
      ),
      "Avatar removed",
    );
  }

  return (
    <div className="flex items-center gap-4 border-b border-(--hairline) px-5 py-5">
      {profile.image ? (
        <Image
          src={profile.image}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="size-16 shrink-0 rounded-full border border-(--hairline-strong) object-cover"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-(--hairline-strong) bg-white/4 font-geist-mono text-xl font-medium text-foreground">
          {(profile.name[0] ?? profile.username[0] ?? "M").toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Avatar</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPEG, or WebP. Cropped to a square.
        </p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) upload(file);
        }}
      />
      <div className="flex shrink-0 gap-2">
        {profile.image && (
          <Button variant="ghost" disabled={busy} onClick={remove}>
            Remove
          </Button>
        )}
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload className="size-4" />
          {busy ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </div>
  );
}

/** Crops an image to its centre square and scales it to the avatar size. */
async function squareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That file isn't an image we can read.");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser can't resize images.");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The image couldn't be saved.")),
      "image/webp",
      0.9,
    ),
  );
}

/** The account email, with a confirmed change to a new address. */
function EmailField({ email }: { email: string }) {
  const pathname = usePathname();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  function requestChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = newEmail.trim().toLowerCase();
    if (!next || next === email || busy) return;
    setBusy(true);
    void authClient
      .changeEmail({ newEmail: next, callbackURL: `${pathname}#general` })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "Your email couldn't be changed.",
          );
          return;
        }
        setSent(next);
        setEditing(false);
        setNewEmail("");
      })
      .catch(() => toast.error("Your email couldn't be changed."))
      .finally(() => setBusy(false));
  }

  return (
    <div className="space-y-2 text-xs text-muted-foreground sm:col-span-2">
      <label htmlFor="profile-email">Email</label>
      <div className="flex gap-2">
        <Input id="profile-email" value={email} readOnly disabled />
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Change
          </Button>
        )}
      </div>
      {sent && !editing && (
        <p>
          Check {email} to approve the change to {sent}, then confirm it from
          the email we send there.
        </p>
      )}
      {editing && (
        <form onSubmit={requestChange} className="flex gap-2 pt-1">
          <Input
            aria-label="New email"
            type="email"
            autoComplete="email"
            placeholder="new@example.com"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
          />
          <Button type="submit" disabled={busy || !newEmail.trim()}>
            {busy ? "Sending…" : "Send confirmation"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
