# MULTIVRS — System Architecture

> Status: **Draft v1** · Companion to [`apps/web/PLAN.md`](apps/web/PLAN.md).
> This is the *whole-system* view ("what we need for everything"); PLAN.md is the
> package-by-package engineering breakdown and language strategy.

Multivrs is a deployment platform (Vercel-class): connect a repo, we detect the
framework, build it, optimize its assets, store immutable artifacts, and serve
them on a global edge with domains, TLS, firewall, analytics, logs and email.
Our own framework **`swift-rust`** is a first-class deploy target next to Next.js.

---

## 1. The three planes

Everything separates into three planes. Confusing them is the #1 mistake.

| Plane | Holds | Tech |
|---|---|---|
| **Control plane** (metadata DB) | users, teams, projects, deployments, domains, env vars, billing — *pointers, not files* | **Neon** (Postgres) via Prisma |
| **Real-time layer** (live projection) | derived/ephemeral state pushed live to the dashboard: deploy status, build-log tails, presence, notifications, activity feeds | **Convex** (`@repo/backend`) |
| **Artifact storage** (object store) | the build output: static files, function bundles, the `swift-rust` binary — immutable, content-addressed | **Cloudflare R2** (S3-compatible) |
| **Compute** (runtime) | executes SSR / functions / binaries *per request* | Cloudflare Workers (edge) + Fly.io / containers (full SSR + binaries) |

> Deployed projects do **not** live in Neon. Neon stores a row saying
> *"project X, production → deployment abc123"*; the files for `abc123` live in
> R2; if it needs SSR, it runs on compute.

> **Neon vs. Convex (don't conflate).** Neon is the **system of record** for all
> durable/transactional data, written through Prisma. Convex is a **real-time
> projection** for things the dashboard must see *live* — it is fed *from* Neon
> (Better Auth DB hooks → `apps/web/src/lib/convex-sync.ts` → Convex mutations)
> and is **never** the source of truth. Sync is best-effort: a failure is logged
> and retried but must not block the Neon write. Full rules in
> [`apps/web/DATABASE.md`](apps/web/DATABASE.md).

---

## 2. Component map — everything we need

| Subsystem | Job | Lang | Phase |
|---|---|---|---|
| Dashboard (`apps/web`) | Control-plane UI (projects, deploys, domains, …) | TS / Next | now |
| Control-plane API | CRUD for projects/deploys/domains/env; webhooks | TS | 0 |
| `config` | `multivrs.json` schema (zod) + types | TS | 0 |
| `client` | typed API client (CLI + dashboard) | TS | 0 |
| `fs-detectors` + `frameworks` | detect framework / package manager / monorepo | TS | 1 |
| `builder-next` | build Next.js → assets + functions | TS | 1 |
| `builder-swift-rust` | build swift-rust → binary + assets (per render mode) | TS→Rust | 1 |
| **Asset optimizer** | compress/transcode public assets (see §5) | Rust | 1 |
| `builder-core` | content hashing, tar, parallel upload, sandbox exec | Rust | 1 |
| `cli` | single-binary deploy CLI | Rust | 1 |
| `proxy` / edge router | TLS, route domain→deployment, static-vs-compute | Go / Cloudflare | 1–2 |
| `functions-runtime` + `edge` | runtime helpers, middleware primitives | TS | 2 |
| `routing-utils` | routes/redirects/rewrites/headers rule engine | TS (+Rust matcher) | 2 |
| `firewall` | WAF/bot rules (control plane) + enforcement | TS + Go/Cloudflare | 3 |
| Domains | register/resell (reseller API) + DNS/TLS (Cloudflare) + pricing/auto-config — §7 | TS + reseller + CF | 1–3 |
| Email (platform) | transactional notifications | Resend | 0–1 |
| Email (customer) | DNS-based: forwarding (CF Routing) or connect-your-own — §8 | — | later |
| Analytics / Speed Insights | page views + Web Vitals ingest + query | TS + columnar store | 3 |
| Logs | function + edge log streaming/tail | Go ingest + columnar | 3 |
| Observability | OTel traces/metrics | TS/OTel | 3 |

Full per-package mapping to Vercel's monorepo is in [PLAN.md §1](apps/web/PLAN.md).

---

## 3. Build & deploy pipeline

```
push (git webhook | CLI upload)
  └─▶ detect         framework + package manager + monorepo (fs-detectors)
  └─▶ build          builder-next | builder-swift-rust
  └─▶ optimize       asset optimizer over /public + emitted assets (§5)
  └─▶ artifact       immutable, content-addressed snapshot
  └─▶ upload         builder-core → R2; metadata row → Neon
  └─▶ alias          production domain pointer flips atomically → instant rollback
```

Every deploy is **immutable** and gets a unique URL (`proj-abc123.multivrs.app`).
Production/custom domains are **aliases** (pointers) to a deployment id —
promotion and rollback never rebuild, they just re-point.

---

## 4. swift-rust rendering modes → platform behavior

swift-rust compiles TSX (Rust + Bun backend) and supports four render modes. The
build **manifest must declare the mode per route**, because it decides whether we
serve from storage or invoke compute:

| Mode | What it is | Build output | Serving | Needs compute? |
|---|---|---|---|---|
| `ssr` | server-rendered HTML | binary + assets | edge invokes binary, returns HTML | **Yes** |
| `ssr-wasm` | SSR + hydrate via WebAssembly | binary + `.wasm` hydration bundle + assets | SSR on compute; `.wasm` served static | **Yes** (+ static wasm) |
| `ssr-htmx` | SSR + htmx progressive enhancement | binary + tiny htmx client + assets | SSR + HTML-fragment endpoints on compute | **Yes** (light) |
| `wasm` | client-side SPA in WebAssembly | `index.html` + `.wasm` + assets | **fully static** — served from R2/CDN | **No** |

Implications:
- `wasm` deploys are static → cheapest, served entirely from R2/CDN/edge cache,
  no runtime billing.
- the `ssr*` modes need a compute target that runs the binary (Fly.io / container
  / microVM). The single statically-linked binary makes this trivial to host.
- the router reads the manifest's per-route mode and chooses **static vs invoke**.
- this maps cleanly onto Next.js too (static export ≈ `wasm`; SSR/route handlers ≈
  `ssr`), so one serving model covers both frameworks.

---

## 5. Asset optimization pipeline

swift-rust already optimizes files in `/public` **locally at build** (e.g. a 3 MB
image → ~234 KB with no visible quality loss; plus AVIF/WebP images, font
subsetting, video, PDF). **Multivrs lifts this to a platform capability for every
framework** — like Vercel's Image Optimization, but build-time first.

**Two layers:**
1. **Build-time (precompute)** — during `optimize`, walk `/public` + emitted
   assets and produce optimized variants, stored in R2 alongside the artifact.
   Deterministic, cached by content hash so unchanged assets are never re-encoded.
2. **On-demand (edge)** — a `/_image?url=…&w=…&q=…` endpoint resizes/reformats on
   first request and caches the result. Covers user-supplied/remote images.

**By asset type:**
| Type | Transform | Tooling (Rust-first) |
|---|---|---|
| Images | AVIF / WebP (+ fallback), responsive sizes, strip metadata | `image-rs`, `ravif`/libaom, `mozjpeg`, `oxipng`, libvips |
| Fonts | subset to used glyphs, `woff2` | `fonttools`-equiv / Rust subsetter |
| Video | transcode H.264/AV1, optional HLS, poster frames | `ffmpeg` |
| Text (JS/CSS/HTML/JSON/SVG) | minify + **Brotli** (precompressed) | `brotli`, minifiers |
| PDF | linearize, downsample embedded images | pdf tooling |

**Lossless vs perceptual** (the "no quality loss" claim):
- **Truly lossless**: Brotli/gzip for text, `oxipng`/zopfli for PNG, lossless WebP —
  byte-reversible, zero visual change.
- **Visually/perceptually lossless**: AVIF/WebP at high quality (q≈82–90) — this is
  where a 3 MB JPEG/PNG becomes ~234 KB with no *perceptible* difference (SSIM/
  butteraugli-bounded). This is the headline win and the default for photos.

Because it's CPU-bound and parallel, the optimizer lives in the **Rust**
`builder-core` (per the language strategy), invoked by every builder.

---

## 6. Request lifecycle (serve)

```
visitor → edge (TLS · firewall · bot challenge)
        → router (custom hostname → alias → deployment id → per-route mode)
        → STATIC  : serve precompressed asset from R2/CDN (incl. optimized images)
        → COMPUTE : invoke function / swift-rust binary, stream response
        → telemetry: access logs + analytics beacons → ingestion → columnar store
```

In v1 the **edge is Cloudflare** (Workers + cache + R2 binding); a dedicated **Go
proxy** replaces/augments it later for full control.

---

## 7. Domains — registration, DNS/TLS, pricing, auto-config

### 7.1 Two separate roles (don't conflate)
- **Registration / reselling** (buying a domain for a customer, with *our* markup)
  → a **registrar reseller API**. **Not Cloudflare.** The Cloudflare Registrar API
  *can* register domains, but only **into your own account at-cost**, with **no
  reseller / markup / multi-tenant** model and **no API renewals or transfers yet**
  — so it's only for *our own* domains (`multivrs.app`, `c-technology-inc.com`),
  never customer resale. **Registrar reseller: Openprovider** — a true at-cost
  white-label reseller (membership = domains at ~registry cost ~$10.40), 2,000+
  TLDs, modern REST API + OpenAPI + sandbox, register/renew/transfer, **free to
  start**. Rules: **buy at-cost, never a registrar's retail price** (otherwise no
  margin); cannot buy from Verisign directly without ICANN accreditation
  (~$8k/yr); ignore "$4/$9.95 first-year" teasers — those are promos, the renewal
  (~$11) is the real cost.
- **DNS + TLS + edge + email routing** (hosting the zone) → **Cloudflare** (free).
  After registering, we point the domain's nameservers at Cloudflare (zone added
  via the CF API).

### 7.1a Cost reality (read before pricing)
Commodity TLDs have a **registry-set wholesale floor that's identical for
everyone**: **.com = $10.26/yr → $10.97 from Nov 2026** (Verisign) + ICANN ~$0.20.
Cloudflare sells .com **at-cost (~$10.44, $0 margin)**; Vercel at **$11.25**
(floor + ~$0.80). A **reseller** buys *through a middleman*, so your .com **cost**
is ~$10.50–$12 — meaning **you cannot undercut Cloudflare/Vercel on .com** (they
buy direct from the registry; at-cost requires ~$8k/yr **ICANN accreditation**).
**Takeaway: domains are a near-break-even convenience, not a profit center** —
make money on the platform (plans/compute), price domains at/near cost.
**$0 launch:** skip reselling — free `*.multivrs.app` subdomains + *bring-your-own*
domains (Cloudflare for SaaS); add OpenSRS/Enom reselling once you have volume.

### 7.2 Selling domains
Fund a balance with the reseller (OpenSRS/Enom). Customer pays **retail** (Stripe);
we pay **wholesale** to the reseller; margin = retail − wholesale − fees (ICANN
~$0.18 on gTLDs, payment ~2.9% + 30¢, FX buffer). Register/renew/transfer all run
through the reseller API; status + expiry stored in Neon.

### 7.3 Pricing engine — never price TLDs one-by-one
Pull the reseller's **wholesale price per TLD** from their API, then apply one
**markup rule**:

```
retail = roundTo99( max( cost × (1 + marginPct), cost + minMargin ) )
```

- `marginPct` (e.g. 15–20%) gives proportional margin on pricey TLDs (.ai, .io);
- `minMargin` (e.g. +$2–3) protects thin cheap TLDs where 5% of $10 = $0.50;
- optional **per-category or per-TLD overrides** for the few specials.

So you configure *one formula* (+ a handful of overrides), not hundreds of prices.
Re-pull wholesale on a schedule (registry prices change) and recompute/cache retail.

### 7.4 Discounts & promos
Model a promo as a rule, **scoped to the action and year** — discounts apply to the
**first registration year only; renewal is always full retail**:

```
promo = { scope: "register", years: 1,
          type: "percentOff" | "fixedPrice" | "atCost", value, code? }
guard: discountedRetail ≥ floor (cost + fees)   // unless an intentional loss-leader
```

- A 1% first-year discount is too small to matter — first-year promos are usually
  bigger loss-leaders (e.g. 30–50% off year one, or "first year at cost").
- **Transparency (ICANN / consumer rules):** always show *"first year $X, renews at
  $Y/yr"* — never hide the renewal price.

### 7.5 Auto-config — zero-DNS when the domain is bought from us
Because a domain registered through us has its **zone on Cloudflare**, we own its
DNS and provision everything **automatically, no manual records**:
- **Site**: A/AAAA/CNAME → our edge; TXT verification; **TLS auto-issued**.
- **Email**: MX + SPF + DKIM + DMARC for free forwarding (Cloudflare Email
  Routing), or the records for a "connect your own" provider (Google/Zoho).
- **Routing**: alias the new hostname → the project's production deployment.

One purchase → working site **and** email, instantly. (A domain a user *brings*
from elsewhere still works via **Cloudflare for SaaS / Custom Hostnames** — they
CNAME to us and Cloudflare auto-provisions per-hostname TLS — but since we don't
control its DNS, those steps are guided rather than automatic.)

---

## 8. Platform services

- **Firewall / bot**: TS control plane writes rules (rate limits, IP rules,
  managed rulesets, attack mode); enforcement via Cloudflare **WAF** + **Turnstile**
  + DDoS (later, our Go proxy).
- **Email** — three roles, kept separate (Resend *sends*, Cloudflare *forwards*):
  1. *Platform sending* (deploy alerts, resets, invites) → **Resend**, from a
     verified domain (`c-technology-inc.com` and/or `noreply@multivrs.app`).
     **Outbound only** — Resend does not receive or forward.
  2. *Free-user forwarding perk* — each project can get
     `projectname@multivrs.app` that **forwards to the user's own inbox** (e.g.
     their Gmail) via **Cloudflare Email Routing** on the `multivrs.app` zone
     (free). User verifies their inbox as the destination once; mail then lands
     there. Per-zone rule limits are fine early; at large scale move to a
     catch-all **Email Worker** or a dedicated forwarder (e.g. ForwardEmail).
  3. *Paid add-on — à la carte, NOT bundled in any plan*: **buy a domain**
     (Cloudflare **reseller**). Email on that domain is then just **DNS we manage**
     — either free forwarding (#2) or **"connect your own email platform"**
     (Google Workspace / Zoho / etc.: we write their MX/DKIM records). **We do NOT
     host mailboxes** — owning the domain + DNS is what enables email.

  No-money users still get a working `*.multivrs.app` subdomain **and** a free
  `@multivrs.app` forwarding address — $0 to them, ~$0 to us.
- **Analytics / Speed Insights**: client beacon (page views + Core Web Vitals) +
  server request analytics → **columnar store** (Cloudflare Analytics Engine /
  ClickHouse / Tinybird). *Never Postgres* for this volume.
- **Logs**: function `stdout`/`stderr` + edge access logs streamed → hot store +
  optional drains; real-time tail to dashboard over websocket.
- **Observability**: OpenTelemetry traces/metrics → collector → store.

---

## 9. Core data model (Neon / Prisma)

```
User ─< Membership >─ Team
Team ─< Project
Project ─< Deployment      (commit, status, renderMode, artifactHash, createdAt)
Project ─< Domain          (hostname, cert status, verified)
Project ─< EnvVar          (key, value(enc), target: prod/preview/dev)
Deployment ─< BuildLog (index; bodies in object/log store)
Project.productionDeploymentId → Deployment   (the alias pointer)
```

Secrets encrypted at rest; large/high-volume data (logs, analytics, artifacts)
live **outside** Postgres.

> **Source vs. artifacts:** the source repo stays in the customer's GitHub — we
> clone it *ephemerally* at build time and discard it; we do **not** keep a
> durable copy of source. What we durably store is the **build output** (static
> files + functions + binary) in R2, because that's what's served on every
> request and what immutable rollback needs. Neon records the commit SHA that
> produced each deployment.

### 9.1 Convex mirror (real-time projection)

A **subset** of Neon state is mirrored into Convex
(`packages/backend/convex/schema.ts`) only where the dashboard needs live push.
Today:

```
users          (authId → Neon user.id, email, name, image, presence, lastSeen)
notifications  (userId → users, type, title, message, read, createdAt)
```

Mirrored rows are keyed by `authId` (the Neon `user.id`) so the two stores join
cleanly. As phases land, deploy status and build-log tails project here too, so
the UI streams them without polling Neon. **Write path is one-way: Neon → Convex.**

---

## 10. Storage strategy

| Data | Store |
|---|---|
| Metadata (pointers, config) | Neon (Postgres) |
| Real-time/derived UI state (presence, notifications, live deploy status) | Convex |
| Build artifacts (files, binaries) | Cloudflare R2 |
| Logs (bodies) | object store + columnar hot store |
| Analytics / metrics / vitals | columnar (Analytics Engine / ClickHouse / Tinybird) |
| Secrets | encrypted in Postgres (envelope encryption) |

---

## 11. Language & runtime strategy (summary)

**TypeScript by default — never plain JS.** Rust/Go/Bun only where they win.
Full rationale + table in [PLAN.md §5](apps/web/PLAN.md).

- **Rust** — CLI (single binary), `builder-core` (hashing/upload + **asset
  optimizer**), swift-rust render core, sandbox/WASM, edge route matcher.
- **Go** — network data plane (proxy/router/TLS), firewall enforcement, log/metrics
  ingestion ("anything network").
- **Bun** — monorepo + package manager, TS build runner, functions dev runtime,
  swift-rust's backend.

---

## 12. Infrastructure bill of materials

What we provision to run all of the above:

| Need | Service (v1) |
|---|---|
| Metadata DB | **Neon** (Postgres) |
| Real-time layer | **Convex** (`@repo/backend`) — live projection of Neon |
| Object storage | **Cloudflare R2** |
| Edge / CDN / cache | **Cloudflare Workers** |
| Custom domains + TLS | **Cloudflare for SaaS** |
| Domain registration/resale | **Openprovider** (at-cost reseller API, free to start). NOT Cloudflare Registrar. |
| WAF + bot + DDoS | **Cloudflare WAF / Turnstile** |
| SSR + binary compute | **Cloudflare Workers** (Next via OpenNext; swift-rust SSR via WASM). Fly.io / Oracle / own fleet only if an app outgrows Workers. |
| Transactional email (platform) | **Resend** |
| Customer email forwarding | **Cloudflare Email Routing** (free) |
| Customer "connect your own email" | set MX/DKIM DNS → their provider (Google/Zoho). We don't host mailboxes. |
| Analytics + logs store | **Cloudflare Analytics Engine** or **Tinybird/ClickHouse** |
| Auth | **Better Auth** (already wired) |
| CI/build runners | **Cloudflare Queues + Sandbox SDK Containers** (Rust `builder-core` + Bun) |

**Realistic v1:** Cloudflare runs the build and data planes: Queues dispatch
builds into isolated Sandbox SDK Containers, R2 stores artifacts, and Workers
serve/execute them. Neon remains the metadata system of record and Resend handles
transactional email. `apps/web` only validates and enqueues; it never compiles
untrusted customer repositories inside a Vercel request.

### 12.1 Starting at $0 (the no-money build)

Every piece has a real free tier **except Fly.io** — and Fly.io's free tier is
gone for new accounts, so we **drop it** and run compute on **Cloudflare Workers'
free plan** instead. Nothing here costs money to start.

| Need | $0 option | Card? |
|---|---|---|
| Metadata DB | **Neon** free, or **Cloudflare D1** (5 GB SQLite) | none |
| Static hosting + custom domain + SSL | **Cloudflare Pages** / Workers Static Assets | none |
| Artifacts (object store) | **R2** (10 GB); if it asks for a card, use Pages / Workers Static Assets / GitHub Releases | R2: maybe |
| Edge compute | **Cloudflare Workers** — 100k req/day | none |
| Next.js SSR | **OpenNext → Workers** (mind the 3 MiB worker size limit on free) | none |
| swift-rust SSR | compile render core to **WASM → Workers** (Workers run WASM natively) | none |
| swift-rust `wasm` / static export | Pages / Workers static — fully free | none |
| Email | **Resend** — 3k/mo, 100/day | none |
| Bot | **Turnstile** | none |
| Auth | **Better Auth** (self-host) | free |
| Build/optimize runners | local runner or **GitHub Actions** for development; Cloudflare Sandbox requires Workers Paid for production | Sandbox: yes |

**Why swift-rust is the cheapest target:** `wasm` mode is fully static (free), and
its Rust core compiles to WASM to run SSR **on Workers** — so swift-rust apps can
be 100% free with no compute server at all.

**Honest caveats:**
- Free Workers cap = **3 MiB** bundle; large Next.js (OpenNext) apps may not fit →
  the cheapest upgrade is **Workers Paid $5/mo**, only when you actually hit it.
- Limits (100k req/day, 10 GB R2, Neon storage/compute hours) are plenty for
  building + first users.
- Need real always-free VMs for native binaries later? **Oracle Cloud Always
  Free** (ARM VMs) — but it needs a card to sign up.

---

## 13. Monorepo layout

**Exists today** (Turborepo + Bun workspaces — `apps/*`, `packages/*`):
```
apps/
  web/                 (TS) Next.js 16 dashboard + control-plane API + Better Auth
packages/
  backend/             (TS) Convex real-time layer            (@repo/backend)
  biome-config/        (TS) shared Biome config               (@repo/biome-config)
  typescript-config/   (TS) shared tsconfig bases             (@repo/typescript-config)
```

**Target** (added across the phases below; names land as `@multivrs/*`):
```
packages/
  build-utils/  fs-detectors/  frameworks/  routing-utils/   (TS)
  config/  client/  error-utils/  functions-runtime/  edge/   (TS)
  builder-next/  builder-swift-rust/  firewall/               (TS)
  cli/                 (Rust)   single-binary CLI
  proxy/               (Go)     request data plane
  builder-core/        (Rust)   hashing, upload, sandbox, ASSET OPTIMIZER
  swift-rust/          (Rust+Bun) our framework (target)
```

---

## 14. Phased roadmap

See [PLAN.md §6](apps/web/PLAN.md). Short version:
**0** foundations (config/client/API + DB models) →
**1** deploy loop for Next + swift-rust (detect/build/optimize/store/serve) →
**2** edge + runtime + routing →
**3** platform services (firewall, domains, logs, analytics, observability) →
**4** more builders/adapters, OIDC, MCP, sandboxes.

**Phase gate:** each phase ends with tests in [`/test`](test) green
(`bun test`). The phase isn't "done" until its gate passes — see
[PLAN.md §8](apps/web/PLAN.md) for the local dev + test workflow.

---

*Sources: github.com/vercel/vercel/tree/main/packages, swift-rust-self.vercel.app,
docs-swift-rust.vercel.app.*
