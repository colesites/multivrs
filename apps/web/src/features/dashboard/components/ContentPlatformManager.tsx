"use client";

import {
  Box,
  ExternalLink,
  FileUp,
  GitBranch,
  KeyRound,
  Plus,
  RefreshCcw,
  Route,
  Save,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  BlobData,
  BulkRedirectData,
  ContentPlatformData,
  EdgeConfigEntryData,
  MicrofrontendRouteData,
} from "@/features/dashboard/types/content-platform.types";

type Notice = { kind: "error" | "success"; text: string } | null;

async function json<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? "The request could not be completed");
  }
  return (await response.json()) as T;
}

const inputClass =
  "h-10 w-full border-0 border-b border-[var(--hairline)] bg-transparent px-0 text-sm outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-purple-400";

type RunAction = <T>(
  key: string,
  task: () => Promise<T>,
  done: (value: T) => void,
) => Promise<void>;
type SetData = React.Dispatch<React.SetStateAction<ContentPlatformData>>;

async function runContentAction<T>({
  done,
  key,
  setBusy,
  setNotice,
  task,
}: {
  done: (value: T) => void;
  key: string;
  setBusy: React.Dispatch<React.SetStateAction<string | null>>;
  setNotice: React.Dispatch<React.SetStateAction<Notice>>;
  task: () => Promise<T>;
}) {
  setBusy(key);
  setNotice(null);
  try {
    const value = await task();
    done(value);
    setNotice({ kind: "success", text: "Changes are live at the edge." });
  } catch (error) {
    setNotice({
      kind: "error",
      text: error instanceof Error ? error.message : "Request failed",
    });
  } finally {
    setBusy(null);
  }
}

export function ContentPlatformManager({
  initialData,
  projectId,
}: {
  initialData: ContentPlatformData;
  projectId: string;
}) {
  const [data, setData] = useState(initialData);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function action<T>(
    key: string,
    task: () => Promise<T>,
    done: (value: T) => void,
  ) {
    return runContentAction({ done, key, setBusy, setNotice, task });
  }

  return (
    <div className="space-y-10 border-t border-[var(--hairline)] pt-9">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.18em] text-purple-400">
            Content platform
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Storage, routing and regeneration
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            These controls write durable configuration, publish a versioned edge
            snapshot, and meter the runtime operations they create.
          </p>
        </div>
        {notice ? (
          <p
            className={
              notice.kind === "error"
                ? "text-xs text-rose-400"
                : "text-xs text-emerald-400"
            }
          >
            {notice.text}
          </p>
        ) : null}
      </div>

      <CacheSection
        busy={busy}
        data={data}
        projectId={projectId}
        run={action}
        setData={setData}
      />
      <BlobSection
        busy={busy}
        blobs={data.blobs}
        projectId={projectId}
        run={action}
        setData={setData}
      />
      <RedirectSection
        busy={busy}
        projectId={projectId}
        redirects={data.redirects}
        run={action}
        setData={setData}
      />
      <EdgeConfigSection
        busy={busy}
        entries={data.edgeConfig}
        projectId={projectId}
        run={action}
        setData={setData}
      />
      <MicrofrontendSection
        busy={busy}
        data={data}
        projectId={projectId}
        run={action}
        setData={setData}
      />
    </div>
  );
}

function Section({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  description: string;
  icon: typeof Box;
  title: string;
}) {
  return (
    <section className="border-t border-[var(--hairline)] pt-6">
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex size-8 items-center justify-center border border-[var(--hairline)] text-purple-400">
          <Icon className="size-4" strokeWidth={1.7} />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function CacheSection({
  busy,
  data,
  projectId,
  run,
  setData,
}: {
  busy: string | null;
  data: ContentPlatformData;
  projectId: string;
  run: RunAction;
  setData: SetData;
}) {
  const [fresh, setFresh] = useState(String(data.settings.defaultRevalidate));
  const [stale, setStale] = useState(String(data.settings.staleWindow));
  const [tag, setTag] = useState("");
  return (
    <Section
      icon={RefreshCcw}
      title="ISR and stale revalidation"
      description="Fresh responses are cached in R2. Stale responses return immediately while one coordinated regeneration runs in the background."
    >
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <label className="text-xs text-muted-foreground">
          Fresh lifetime (seconds)
          <input
            className={inputClass}
            inputMode="numeric"
            value={fresh}
            onChange={(event) => setFresh(event.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Serve-stale window (seconds)
          <input
            className={inputClass}
            inputMode="numeric"
            value={stale}
            onChange={(event) => setStale(event.target.value)}
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <Button
          disabled={busy !== null}
          onClick={() =>
            void run(
              "cache-save",
              () =>
                json(`/api/projects/${projectId}/content`, {
                  method: "PATCH",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    defaultRevalidate: Number(fresh),
                    staleWindow: Number(stale),
                  }),
                }),
              (settings) =>
                setData((current) => ({
                  ...current,
                  settings: settings as ContentPlatformData["settings"],
                })),
            )
          }
        >
          <Save className="size-4" />
          Save cache policy
        </Button>
        <input
          aria-label="Optional cache tag"
          className={`${inputClass} max-w-56`}
          placeholder="Optional tag, e.g. products"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
        />
        <Button
          variant="outline"
          disabled={busy !== null}
          onClick={() =>
            void run(
              "cache-revalidate",
              () =>
                json(`/api/projects/${projectId}/content/revalidate`, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify(tag ? { tag } : {}),
                }),
              () => undefined,
            )
          }
        >
          <RefreshCcw className="size-4" />
          Revalidate {tag ? "tag" : "all"}
        </Button>
      </div>
    </Section>
  );
}

function BlobSection({
  busy,
  blobs,
  projectId,
  run,
  setData,
}: {
  busy: string | null;
  blobs: BlobData[];
  projectId: string;
  run: RunAction;
  setData: SetData;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pathname, setPathname] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("public");
  async function upload(): Promise<BlobData> {
    const file = fileRef.current?.files?.[0];
    if (!file) throw new Error("Choose a file first");
    const prepared = await json<{
      blob: BlobData;
      headers: Record<string, string>;
      uploadUrl: string;
    }>(`/api/projects/${projectId}/blobs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contentType: file.type || "application/octet-stream",
        pathname: pathname || file.name,
        size: file.size,
        visibility,
      }),
    });
    const uploaded = await fetch(prepared.uploadUrl, {
      method: "PUT",
      headers: prepared.headers,
      body: file,
    });
    if (!uploaded.ok) throw new Error(`R2 upload failed (${uploaded.status})`);
    return json(
      `/api/projects/${projectId}/blobs/${prepared.blob.id}/complete`,
      { method: "POST" },
    );
  }
  return (
    <Section
      icon={Box}
      title="Blob storage"
      description="Files upload directly to R2, then Multivrs verifies the object before publishing public or signed private delivery URLs."
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-[1fr_1fr_160px_auto] md:items-end">
        <label className="text-xs text-muted-foreground">
          File
          <input
            ref={fileRef}
            className={`${inputClass} pt-2 file:mr-3 file:border-0 file:bg-transparent file:text-xs file:text-foreground`}
            type="file"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Blob pathname
          <input
            className={inputClass}
            placeholder="images/hero.png"
            value={pathname}
            onChange={(event) => setPathname(event.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Visibility
          <select
            className={inputClass}
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as "private" | "public")
            }
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <Button
          disabled={busy !== null}
          onClick={() =>
            void run("blob-upload", upload, (blob) =>
              setData((current) => ({
                ...current,
                blobs: [
                  blob,
                  ...current.blobs.filter((item) => item.id !== blob.id),
                ],
              })),
            )
          }
        >
          <FileUp className="size-4" />
          Upload
        </Button>
      </div>
      <Rows empty="No blobs uploaded yet.">
        {blobs.map((blob) => (
          <Row
            key={blob.id}
            primary={blob.pathname}
            secondary={`${formatBytes(blob.size)} · ${blob.contentType} · ${blob.visibility}`}
            trailing={
              <>
                <button
                  aria-label={`Open ${blob.pathname}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    void run(
                      `blob-open-${blob.id}`,
                      () =>
                        json<{ downloadUrl: string; edgeUrl: string | null }>(
                          `/api/projects/${projectId}/blobs/${blob.id}`,
                        ),
                      (access) =>
                        window.open(
                          access.edgeUrl ?? access.downloadUrl,
                          "_blank",
                          "noopener,noreferrer",
                        ),
                    )
                  }
                  type="button"
                >
                  <ExternalLink className="size-4" />
                </button>
                <DeleteButton
                  disabled={busy !== null}
                  onClick={() =>
                    void run(
                      `blob-delete-${blob.id}`,
                      () =>
                        json(`/api/projects/${projectId}/blobs/${blob.id}`, {
                          method: "DELETE",
                        }),
                      () =>
                        setData((current) => ({
                          ...current,
                          blobs: current.blobs.filter(
                            (item) => item.id !== blob.id,
                          ),
                        })),
                    )
                  }
                />
              </>
            }
          />
        ))}
      </Rows>
    </Section>
  );
}

function RedirectSection({
  busy,
  projectId,
  redirects,
  run,
  setData,
}: {
  busy: string | null;
  projectId: string;
  redirects: BulkRedirectData[];
  run: RunAction;
  setData: SetData;
}) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [statusCode, setStatusCode] = useState<301 | 302 | 307 | 308>(308);
  return (
    <Section
      icon={Route}
      title="Bulk redirects"
      description="Ordered path-pattern redirects execute at the edge before artifact or function routing. Named parameters and catch-all patterns are supported."
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-[1fr_1fr_120px_auto] md:items-end">
        <label className="text-xs text-muted-foreground">
          Source
          <input
            className={inputClass}
            placeholder="/old/:path*"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Destination
          <input
            className={inputClass}
            placeholder="/new/:path*"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Status
          <select
            className={inputClass}
            value={statusCode}
            onChange={(event) =>
              setStatusCode(Number(event.target.value) as typeof statusCode)
            }
          >
            {[301, 302, 307, 308].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <Button
          disabled={busy !== null || !source || !destination}
          onClick={() =>
            void run(
              "redirect-create",
              () =>
                json(`/api/projects/${projectId}/redirects`, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ destination, source, statusCode }),
                }),
              (redirect) => {
                setData((current) => ({
                  ...current,
                  redirects: [
                    ...current.redirects,
                    redirect as BulkRedirectData,
                  ],
                }));
                setSource("");
                setDestination("");
              },
            )
          }
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      <Rows empty="No edge redirects configured.">
        {redirects.map((redirect) => (
          <Row
            key={redirect.id}
            primary={`${redirect.source} → ${redirect.destination}`}
            secondary={`${redirect.statusCode} · ${redirect.preserveQuery ? "keeps query string" : "drops query string"}`}
            trailing={
              <DeleteButton
                disabled={busy !== null}
                onClick={() =>
                  void run(
                    `redirect-delete-${redirect.id}`,
                    () =>
                      json(
                        `/api/projects/${projectId}/redirects/${redirect.id}`,
                        { method: "DELETE" },
                      ),
                    () =>
                      setData((current) => ({
                        ...current,
                        redirects: current.redirects.filter(
                          (item) => item.id !== redirect.id,
                        ),
                      })),
                  )
                }
              />
            }
          />
        ))}
      </Rows>
    </Section>
  );
}

function EdgeConfigSection({
  busy,
  entries,
  projectId,
  run,
  setData,
}: {
  busy: string | null;
  entries: EdgeConfigEntryData[];
  projectId: string;
  run: RunAction;
  setData: SetData;
}) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  function parsedValue(): unknown {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("Edge Config value must be valid JSON");
    }
  }
  return (
    <Section
      icon={KeyRound}
      title="Edge Config"
      description="Small JSON values are durable in Neon and mirrored to the versioned KV snapshot used by the serving Worker."
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-[240px_1fr_auto] md:items-end">
        <label className="text-xs text-muted-foreground">
          Key
          <input
            className={inputClass}
            placeholder="checkout.enabled"
            value={key}
            onChange={(event) => setKey(event.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          JSON value
          <input
            className={inputClass}
            placeholder='{"percentage":25}'
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <Button
          disabled={busy !== null || !key || !value}
          onClick={() =>
            void run(
              "edge-config-set",
              () =>
                json(`/api/projects/${projectId}/edge-config`, {
                  method: "PUT",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ key, value: parsedValue() }),
                }),
              (entry) => {
                setData((current) => ({
                  ...current,
                  edgeConfig: [
                    ...current.edgeConfig.filter((item) => item.key !== key),
                    entry as EdgeConfigEntryData,
                  ].sort((a, b) => a.key.localeCompare(b.key)),
                }));
                setKey("");
                setValue("");
              },
            )
          }
        >
          <Save className="size-4" />
          Set
        </Button>
      </div>
      <Rows empty="No Edge Config values set.">
        {entries.map((entry) => (
          <Row
            key={entry.id}
            primary={entry.key}
            secondary={JSON.stringify(entry.value)}
            trailing={
              <DeleteButton
                disabled={busy !== null}
                onClick={() =>
                  void run(
                    `edge-config-delete-${entry.id}`,
                    () =>
                      json(
                        `/api/projects/${projectId}/edge-config/${encodeURIComponent(entry.key)}`,
                        { method: "DELETE" },
                      ),
                    () =>
                      setData((current) => ({
                        ...current,
                        edgeConfig: current.edgeConfig.filter(
                          (item) => item.id !== entry.id,
                        ),
                      })),
                  )
                }
              />
            }
          />
        ))}
      </Rows>
    </Section>
  );
}

function MicrofrontendSection({
  busy,
  data,
  projectId,
  run,
  setData,
}: {
  busy: string | null;
  data: ContentPlatformData;
  projectId: string;
  run: RunAction;
  setData: SetData;
}) {
  const [source, setSource] = useState("");
  const [targetProjectId, setTargetProjectId] = useState(
    data.targetProjects[0]?.id ?? "",
  );
  const [stripPrefix, setStripPrefix] = useState(true);
  return (
    <Section
      icon={GitBranch}
      title="Microfrontend routing"
      description="Mount another project’s current production deployment beneath a safe path pattern while preserving the parent hostname."
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-[1fr_1fr_150px_auto] md:items-end">
        <label className="text-xs text-muted-foreground">
          Mount path
          <input
            className={inputClass}
            placeholder="/docs/:path*"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Target project
          <select
            className={inputClass}
            value={targetProjectId}
            onChange={(event) => setTargetProjectId(event.target.value)}
          >
            <option value="">Choose project</option>
            {data.targetProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-10 items-center gap-2 text-xs text-muted-foreground">
          <input
            checked={stripPrefix}
            onChange={(event) => setStripPrefix(event.target.checked)}
            type="checkbox"
          />
          Strip mount path
        </label>
        <Button
          disabled={busy !== null || !source || !targetProjectId}
          onClick={() =>
            void run(
              "microfrontend-create",
              () =>
                json(`/api/projects/${projectId}/microfrontends`, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    source,
                    stripPrefix,
                    targetProjectId,
                  }),
                }),
              (route) => {
                setData((current) => ({
                  ...current,
                  microfrontends: [
                    ...current.microfrontends,
                    route as MicrofrontendRouteData,
                  ],
                }));
                setSource("");
              },
            )
          }
        >
          <Plus className="size-4" />
          Mount
        </Button>
      </div>
      <Rows empty="No microfrontends mounted.">
        {data.microfrontends.map((route) => (
          <Row
            key={route.id}
            primary={`${route.source} → ${route.targetProjectName}`}
            secondary={
              route.stripPrefix
                ? "mount prefix stripped"
                : "full path forwarded"
            }
            trailing={
              <DeleteButton
                disabled={busy !== null}
                onClick={() =>
                  void run(
                    `microfrontend-delete-${route.id}`,
                    () =>
                      json(
                        `/api/projects/${projectId}/microfrontends/${route.id}`,
                        { method: "DELETE" },
                      ),
                    () =>
                      setData((current) => ({
                        ...current,
                        microfrontends: current.microfrontends.filter(
                          (item) => item.id !== route.id,
                        ),
                      })),
                  )
                }
              />
            }
          />
        ))}
      </Rows>
    </Section>
  );
}

function Rows({
  children,
  empty,
}: {
  children: React.ReactNode;
  empty: string;
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);
  return (
    <div className="mt-6 border-y border-[var(--hairline)]">
      {hasChildren ? (
        children
      ) : (
        <p className="py-5 text-xs text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function Row({
  primary,
  secondary,
  trailing,
}: {
  primary: string;
  secondary: string;
  trailing: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center gap-4 border-b border-[var(--hairline)] py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-geist-mono text-xs text-foreground">
          {primary}
        </p>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {secondary}
        </p>
      </div>
      <div className="flex items-center gap-3">{trailing}</div>
    </div>
  );
}

function DeleteButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label="Delete"
      className="text-muted-foreground transition-colors hover:text-rose-400 disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${(value / 1024 ** 3).toFixed(2)} GB`;
}
