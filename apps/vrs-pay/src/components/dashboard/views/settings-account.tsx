import { type FormEvent, useCallback, useEffect, useState } from "react";
import { authRequest } from "@/components/auth/auth-client";
import { UserAvatar } from "../avatar";
import { useDashboard } from "../context";
import { Button, Card, ErrorNote, Input } from "../ui";

const PROVIDER_LABELS: Record<string, string> = {
  credential: "Email and password",
  google: "Google",
  github: "GitHub",
};

/** Your name, email and picture (the picture comes from Google or GitHub). */
export function Profile() {
  const { apiUrl, session, refreshSession } = useDashboard();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(
      new FormData(event.currentTarget).get("name") ?? "",
    ).trim();
    setPending(true);
    const result = await authRequest(apiUrl, "/update-user", { name });
    setPending(false);
    if (!result.ok) return setError(result.message);
    setError(null);
    setSaved(true);
    await refreshSession();
  }

  return (
    <Card>
      <p className="text-sm font-medium text-ink">Profile</p>
      <div className="mt-4 flex items-center gap-4">
        <UserAvatar
          name={session.user.name}
          image={session.user.image}
          size="lg"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {session.user.name}
          </p>
          <p className="truncate text-sm text-mute">{session.user.email}</p>
        </div>
      </div>
      <form onSubmit={save} className="mt-4 flex flex-wrap gap-2">
        <Input
          name="name"
          defaultValue={session.user.name}
          required
          maxLength={100}
          aria-label="Your name"
          className="min-w-0 flex-1"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          Save name
        </Button>
      </form>
      {saved && <p className="mt-2 text-sm text-emerald-700">Saved.</p>}
      {error && (
        <div className="mt-3">
          <ErrorNote message={error} />
        </div>
      )}
    </Card>
  );
}

function listOf(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((a) =>
    typeof a === "object" && a !== null && "providerId" in a
      ? [String(a.providerId)]
      : [],
  );
}

/** How you can sign in: connect or disconnect Google and GitHub, and sign other devices out. */
export function SignInMethods() {
  const { apiUrl } = useDashboard();
  const [linked, setLinked] = useState<string[] | null>(null);
  const [social, setSocial] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [accounts, providers] = await Promise.all([
      authRequest(apiUrl, "/list-accounts"),
      authRequest(apiUrl, "/providers"),
    ]);
    setLinked(accounts.ok ? listOf(accounts.data) : []);
    const configured =
      providers.ok &&
      typeof providers.data === "object" &&
      providers.data !== null
        ? (providers.data as { social?: string[] }).social
        : [];
    setSocial(configured ?? []);
  }, [apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  async function connect(provider: string) {
    setPending(true);
    const result = await authRequest(apiUrl, "/link-social", {
      provider,
      callbackURL: `${window.location.origin}/dashboard?view=settings`,
    });
    setPending(false);
    const url =
      result.ok && typeof result.data === "object" && result.data !== null
        ? (result.data as { url?: string }).url
        : undefined;
    if (url) return window.location.assign(url);
    setError(
      result.ok ? "Couldn't start connecting. Try again." : result.message,
    );
  }

  async function disconnect(providerId: string) {
    setPending(true);
    const result = await authRequest(apiUrl, "/unlink-account", { providerId });
    setPending(false);
    if (!result.ok) return setError(result.message);
    setError(null);
    await load();
  }

  async function signOutOthers() {
    setPending(true);
    const result = await authRequest(apiUrl, "/revoke-other-sessions", {});
    setPending(false);
    if (!result.ok) return setError(result.message);
    setError(null);
    setNote("Signed out everywhere else.");
  }

  const rows = ["credential", ...social];
  const canRemove = (linked?.length ?? 0) > 1;

  return (
    <Card>
      <p className="text-sm font-medium text-ink">Sign-in methods</p>
      <p className="text-sm text-mute">Ways you can get into this account.</p>
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
        {rows.map((provider) => {
          const isLinked = linked?.includes(provider) ?? false;
          return (
            <li
              key={provider}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="text-sm text-ink">
                {PROVIDER_LABELS[provider] ?? provider}
              </span>
              {linked === null ? (
                <span className="text-xs text-mute">…</span>
              ) : isLinked ? (
                <span className="flex items-center gap-3">
                  <span className="text-xs font-medium text-emerald-700">
                    Connected
                  </span>
                  {provider !== "credential" && canRemove && (
                    <Button
                      type="button"
                      variant="link"
                      disabled={pending}
                      onClick={() => disconnect(provider)}
                      className="h-auto px-0 text-xs text-red-700 hover:text-red-800"
                    >
                      Disconnect
                    </Button>
                  )}
                </span>
              ) : provider === "credential" ? (
                <span className="text-xs text-mute">Not set up</span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => connect(provider)}
                >
                  Connect
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={signOutOthers}
        >
          Sign out other devices
        </Button>
        {note && <span className="text-sm text-emerald-700">{note}</span>}
      </div>
      {error && (
        <div className="mt-3">
          <ErrorNote message={error} />
        </div>
      )}
    </Card>
  );
}
