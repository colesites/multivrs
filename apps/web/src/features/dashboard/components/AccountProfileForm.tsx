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

import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";

const AVATAR_SIZE = 256;

export function AccountProfileForm({
  initialProfile,
}: {
  initialProfile: AccountProfile;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [username, setUsername] = useState(initialProfile.username);
  const [savingName, setSavingName] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);

  function saveField(field: "name" | "username", value: string) {
    const isName = field === "name";
    if (isName) setSavingName(true);
    else setSavingUsername(true);

    void requestOk(
      "/api/account/profile",
      {
        body: JSON.stringify({
          name: isName ? value : profile.name,
          username: isName ? profile.username : value,
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
        setName(updated.name);
        setUsername(updated.username);
        toast.success(isName ? "Display name updated" : "Username updated");
        if (updated.username !== initialProfile.username)
          router.replace(`/${updated.username}/~/settings`);
        router.refresh();
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Profile update failed")),
      )
      .finally(() => {
        if (isName) setSavingName(false);
        else setSavingUsername(false);
      });
  }

  return (
    <div className="space-y-6">
      {/* Avatar Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Avatar"
          description="This is your avatar. Upload a custom avatar from your files."
        >
          <AvatarField
            profile={profile}
            onChange={(updated) => {
              setProfile({ ...profile, image: updated.image });
              router.refresh();
            }}
          />
        </SettingsCardBody>
        <SettingsCardFooter helperText="An avatar is optional but strongly recommended." />
      </SettingsCard>

      {/* Display Name Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Display Name"
          description="Please enter your full name, or a display name you are comfortable with."
        >
          <Input
            id="profile-name"
            maxLength={32}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="max-w-md font-sans text-sm"
            placeholder="Your name"
          />
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Please use 32 characters at maximum."
          action={
            <Button
              size="sm"
              disabled={savingName || name === profile.name || !name.trim()}
              onClick={() => saveField("name", name.trim())}
            >
              {savingName ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* Username Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Username"
          description="This is your URL namespace within Multivrs."
        >
          <div className="flex max-w-md items-center rounded-md border border-input bg-transparent shadow-xs focus-within:ring-1 focus-within:ring-ring">
            <span className="flex select-none items-center pl-3 text-xs text-muted-foreground">
              multivrs.space/
            </span>
            <input
              id="profile-username"
              maxLength={48}
              value={username}
              onChange={(event) =>
                setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
              className="flex h-9 w-full bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="username"
            />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Please use 48 characters at maximum."
          action={
            <Button
              size="sm"
              disabled={savingUsername || username === profile.username || !username.trim()}
              onClick={() => saveField("username", username.trim())}
            >
              {savingUsername ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* Email Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Email"
          description="Your primary account email address."
        >
          <div className="max-w-md">
            <EmailField email={profile.email} />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter helperText="Used for notifications, invoices, and password resets." />
      </SettingsCard>
    </div>
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
