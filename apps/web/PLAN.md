# MULTIVRS Platform — Build & Deploy Engineering Plan

> Status: **Phases 0–5 implemented (2026-07-26)** · Owner: Cole · Scope: the
> complete deployment platform, control plane, integrations, and dashboard UI.
> Whole-system view (planes, infra, request lifecycle): [`/ARCHITECTURE.md`](../../ARCHITECTURE.md).

Multivrs is a deployment platform in the spirit of Vercel: push a repo, we
detect the framework, build it, and serve it on a global edge with logs,
analytics, firewall, domains, etc. The differentiator: **our own framework,
[`swift-rust`](https://swift-rust-self.vercel.app/)
([docs](https://docs-swift-rust.vercel.app/)), is a first-class deploy target
alongside Next.js.**

We study Vercel's open monorepo (https://github.com/vercel/vercel/tree/main/packages)
as the reference architecture, then build our own equivalents — **TypeScript by
default, Rust/Go where they earn their place** (see §5).

---

## 1. Reference: every package in `vercel/vercel`

Pulled live from the repo. Grouped by role, with a one-line note and whether it
is in our **starting set**.

### 1.1 Build pipeline — detection & shared utils
| Package | What it does | Start? |
|---|---|---|
| `build-utils` | Shared helpers all builders use (file globbing, lambda packaging, framework version detection). | ✅ core |
| `fs-detectors` | Inspect a filesystem to detect framework, package manager, monorepo/workspace layout. | ✅ core |
| `frameworks` | The framework preset catalog (build command, output dir, dev command, env) used by detection. | ✅ core |
| `static-config` | Parse `export const config`/route segment config out of source files. | ◻ later |
| `detect-agent` | Detect if we're running inside an AI agent / automated dev env (Cursor, Claude, Devin). | ◻ later |
| `related-projects` | Resolve related projects in a monorepo. | ◻ later |
| `routing-utils` | Parse & match `routes`, redirects, rewrites, headers, cleanUrls — the routing rule engine. | ✅ core |

### 1.2 Builders — framework/runtime → deployable output
| Package | What it does | Start? |
|---|---|---|
| `next` | **Next.js builder** — turns a Next app into functions + static assets. | ✅ **start** |
| `rust` | Rust builder (compile Rust → function/binary). Foundation we lean on for `swift-rust`. | ✅ **start** |
| `static-build` | Run any framework's build command, capture static/SSR output. | ✅ core |
| `node` | Node serverless function builder. | ◻ later |
| `go` | Go builder. | ◻ later |
| `python` / `python-analysis` | Python builder + import/dependency analysis. | ◻ later |
| `ruby` | Ruby builder. | ◻ later |
| `remix`, `react-router`, `redwood`, `hydrogen` | Framework-specific builders/adapters. | ◻ later |
| `gatsby-plugin-vercel-builder`, `gatsby-plugin-vercel-analytics` | Gatsby build + analytics plugins. | ◻ skip early |

### 1.3 Server-framework adapters (run a framework on Functions)
| Package | What it does | Start? |
|---|---|---|
| `express`, `fastify`, `koa`, `nestjs`, `hono`, `elysia`, `h3` | Adapters that wrap each Node/edge HTTP framework so it runs on the Functions runtime. | ◻ later (pick 1–2: `hono`, `h3`) |

### 1.4 Runtime, edge & functions
| Package | What it does | Start? |
|---|---|---|
| `functions` | `@vercel/functions` — runtime helpers available inside a deployed function (geo, env, waitUntil…). | ✅ core |
| `edge` | Edge runtime utilities / middleware primitives. | ✅ core |
| `backends` | Backend infrastructure layer (consumed by the native `cervel` CLI). | ◻ later |
| `cervel` | Native CLI binary built on `@vercel/backends` — Vercel's move toward a native (non-Node) backend CLI. Signal: **the platform core is going native.** | ◻ later (study) |
| `vc-native` | Internal staging tools for the **native** (compiled, no-Node) Vercel CLI. Same signal as above. | ◻ later (study) |
| `mcp-adapter` | Adapter to expose/host MCP servers as functions. | ◻ later |
| `oidc`, `oidc-aws-credentials-provider` | OIDC federation; exchange platform OIDC tokens for cloud (AWS) creds. | ◻ later |
| `aws` | AWS integration helpers. | ◻ later |

### 1.5 CLI & client
| Package | What it does | Start? |
|---|---|---|
| `cli` | The main `vercel`/`vc` CLI. | ✅ **start** (thin) |
| `cli-auth` | Auth concerns of the CLI (login, tokens). | ✅ start |
| `cli-config` | CLI config/`.vercel` project linking. | ✅ start |
| `cli-exec` | Command execution / subprocess orchestration. | ◻ later |
| `client` | Typed API client the CLI uses to talk to the platform API. | ✅ core |
| `config` | Shared config schema/types (`vercel.json` shape). | ✅ core |
| `connect` | Connectors for auth + AI frameworks (Better Auth, Auth.js, OIDC, AI SDK, MCP, Eve runtime). | ◻ later (we already use Better Auth) |
| `error-utils` | Shared typed error helpers. | ✅ core |

### 1.6 Security / network
| Package | What it does | Start? |
|---|---|---|
| `firewall` | WAF rules, IP blocking, rate limiting, managed rulesets, attack mode. | ✅ core (control plane first) |

> "cervel" the user asked about = `@vercel/cervel`, a **native CLI binary** that
> depends on `@vercel/backends`. Together with `vc-native` it shows Vercel
> compiling the CLI/backend to a native binary — strong precedent for our Rust
> CLI decision (§5).

---

## 2. What we build first (Phase 1 deploy targets)

Per direction, the two starting deploy targets are **Next.js** and our own
**swift-rust**. Minimum viable deploy loop:

```
repo ──▶ detect (fs-detectors + frameworks)
      ──▶ build  (builder-next | builder-swift-rust)
      ──▶ artifact (static assets + function/binary, content-addressed)
      ──▶ upload (client → platform API)
      ──▶ serve  (proxy → static | function | swift-rust binary)
      ──▶ observe (logs, status in dashboard)
```

### 2.1 What `next` vs `swift-rust` builders produce
- **Next.js** (`builder-next`): a `.next` build → static assets + serverless/edge
  functions (SSR/route handlers/ISR). Mirrors `@vercel/next`.
- **swift-rust** (`builder-swift-rust`): swift-rust compiles TSX (with Rust + Bun
  backend) into **one statically-linked binary** supporting `ssr`, `ssr-wasm`,
  `ssr-htmx`, and `wasm` modes. The "build output" is that binary + its static
  assets; the runtime just executes the binary (no Node). This is *simpler* to
  host than Next and plays directly to a Rust/Go data plane.

> Confirmed framing: **`next` = deploy Next.js apps; `swift-rust` = deploy
> swift-rust apps.** Both go through the same detect→build→artifact→serve loop;
> only the builder + runtime differ.

### 2.2 swift-rust rendering modes drive serving

swift-rust has four render modes; the build **manifest declares the mode per
route**, and that decides whether we serve from storage or invoke compute:

| Mode | Output | Serving | Compute? |
|---|---|---|---|
| `ssr` | binary + assets | edge invokes binary → HTML | yes |
| `ssr-wasm` | binary + `.wasm` hydration bundle | SSR + static `.wasm` | yes |
| `ssr-htmx` | binary + tiny htmx client | SSR + HTML-fragment endpoints | yes (light) |
| `wasm` | `index.html` + `.wasm` | **fully static** (R2/CDN only) | **no** |

`wasm` = cheapest (static, no runtime billing). The `ssr*` modes need a compute
target running the single binary (Fly/container/microVM). The router reads the
manifest and picks **static vs invoke** — the same model maps onto Next.js
(static export ≈ `wasm`, SSR ≈ `ssr`). Detail in
[ARCHITECTURE.md §4](../../ARCHITECTURE.md).

### 2.3 Asset optimization (the `/public` win)

swift-rust optimizes `/public` **locally at build** (e.g. a 3 MB image → ~234 KB
with no visible quality loss; AVIF/WebP, font subsetting, video, PDF). Multivrs
**lifts this to a platform capability for every framework** (like Vercel Image
Optimization, but build-time first):

- **Build-time precompute**: during build, optimize `/public` + emitted assets →
  store variants in R2, cached by content hash (unchanged assets never re-encode).
- **On-demand edge**: `/_image?url=&w=&q=` resizes/reformats on first hit, cached.
- **Lossless** (Brotli text, `oxipng`/lossless WebP) + **perceptual** (AVIF/WebP
  q≈82–90, SSIM/butteraugli-bounded) — the latter is the 3 MB → 234 KB headline.
- CPU-bound + parallel → lives in the **Rust `builder-core`**, called by every
  builder. Tooling table in [ARCHITECTURE.md §5](../../ARCHITECTURE.md).

---

## 3. Proposed Multivrs package layout

Turborepo `packages/*` (workspaces), TS-first, each its own purpose (≤150-line
files per `RULES.md`). New platform packages land as `@multivrs/*`.

**What exists today** (run `bun dev` from the root to start both):
```
apps/
  web/                 (TS) Next.js 16 dashboard + control-plane API + Better Auth
packages/
  backend/             (TS) Convex real-time layer            @repo/backend
  biome-config/        (TS) shared Biome config               @repo/biome-config
  typescript-config/   (TS) shared tsconfig bases             @repo/typescript-config
```

Data layer (see `apps/web/DATABASE.md`): **Neon (Postgres via Prisma)** is the
system of record; **Convex (`@repo/backend`)** is a one-way real-time projection
fed by Better Auth hooks. Both run from the root — `bun dev:web` / `bun dev:convex`
to run one in isolation.

**Implemented platform packages:**
```
packages/
  adapter-h3/ adapter-hono/     framework adapters
  build-utils/ static-build/    artifact/build primitives
  builder-next/                 full OpenNext Cloudflare builder
  builder-swift-rust/           swift-rust artifact mapper
  builder-runtime/              Node, Go, Python, Ruby, Remix, Hono, h3
  builder-core/                 Rust hashing + asset optimizer
  cli/ cli-auth/ cli-config/    native Rust CLI
  client/ config/ error-utils/  typed API/config/error contracts
  edge/ functions/ firewall/    runtime and security primitives
  frameworks/ fs-detectors/     detection and framework catalog
  routing-utils/                TypeScript routing control logic
  routing-matcher-wasm/         Rust/WASM hot-path matcher
  mcp-adapter/                  MCP request adapter
  backend/                      Convex real-time projection
```

```
apps/
  web/             Next.js dashboard + authenticated control plane
  build-worker/    Cloudflare Queue consumer + Sandbox SDK builder
  compute-worker/  Cloudflare Container runtime for executable artifacts
  serve-worker/    Cloudflare edge router, assets, WAF, telemetry, dispatch
  mail-worker/     ✅ Durable outbound mail queue, cron scheduler, and DLQ
  mail-smtp/       ✅ TLS SMTP submission gateway using tenant-scoped credentials
```

---

## 4. Language policy

- **TypeScript only — never plain JavaScript.** Every `.js` we'd otherwise copy
  from Vercel's packages is rewritten as **`.ts`** for type safety (project rule).
  All builders, adapters, SDKs, schemas, the dashboard, and the control-plane API
  are TypeScript. Zod validates every external boundary (config files, API
  payloads, build manifests).
- Rust, Go, and Bun are introduced **only** where they give a real win (next
  section) — not by default.

---

## 5. Where Rust / Go / Bun beat TypeScript

Analysis of the reference architecture → our recommendation.

### 5.1 Rust — native binaries, CPU-bound correctness
| Use it for | Why | Vercel precedent |
|---|---|---|
| **The CLI** (`@multivrs/cli`) | Single statically-linked binary, instant cold start, no Node install, signable. | `cervel` + `vc-native` (Vercel is going native) |
| **Builder core** (hashing, tar, parallel upload) | Content-addressed deploys need fast blake3 hashing + parallel IO; Rust is ideal. | `build-utils` hot paths |
| **Asset optimizer** (§2.3) | Image/video/font compression is CPU-bound and parallel — `image-rs`/`ravif`/`oxipng`/libvips. The 3 MB → 234 KB win. | Vercel Image Optimization |
| **swift-rust rendering core** | Already Rust; it's the whole point of the framework. | `rust` builder |
| **Sandboxed build/exec + WASM pipeline** | Safe execution of untrusted user build steps; WASM compile for `ssr-wasm`. | Vercel Sandbox / `edge` |
| **Routing matcher (hot path / WASM at edge)** | Route resolution runs on every request; compile `routing-utils` rules to a Rust/WASM matcher. | `routing-utils` |

### 5.2 Go — the network data plane & security
| Use it for | Why |
|---|---|
| **Edge proxy / request router** (`@multivrs/proxy`) | Terminate TLS, route to static/function/swift-rust binary; Go's `net/http` + goroutines are purpose-built for high-concurrency networking. |
| **Firewall data plane** (rate limiting, IP rules, DDoS, attack mode) | Network security at line rate — exactly the "anything network" the user flagged for Go. Control plane stays TS (`firewall` package); Go enforces. |
| **Log / metrics ingestion** | High-throughput fan-in pipeline feeding Observability/Analytics/Logs. |
| **Health checks / connection pooling to function workers** | Long-lived network plumbing. |

### 5.3 Bun — fast JS/TS runtime for our services & dev
| Use it for | Why |
|---|---|
| **Monorepo + package manager** | Already mandated (`bun` only). |
| **Build pipeline runner / TS execution** | Native TS, fast startup; runs the TS builders without a transpile step. |
| **Functions dev runtime + local edge emulation** | Fast cold start for `dev`; emulate the Functions/Edge runtime locally. |
| **swift-rust backend** | swift-rust already pairs Rust with **Bun** as its backend — we stay consistent. |

### 5.4 Rule of thumb
> Control plane, schemas, builders, SDKs, dashboard → **TypeScript**.
> Anything on the request hot path or the network → **Go**.
> Single-binary tools, CPU-bound build internals, the framework core → **Rust**.
> The JS/TS runtime everywhere we run JS/TS → **Bun**.

---

## 6. Phased roadmap

Every phase ends with a **gate**: the tests in [`/test`](../../test) for that
phase must pass (`bun test`) before the phase is "done" and the next begins. See
§8 for the workflow.

**Done so far (pre-0):** Turborepo + Bun monorepo; Next.js 16 dashboard shell
(marketing + auth + dashboard routes); Better Auth (email/password + Google/GitHub
OAuth + username plugin); dual-DB foundation — Neon/Prisma system of record +
Convex real-time layer, synced via Better Auth hooks; root scripts to run web +
convex together.

**Phase 0 — Foundations** — ✅ built (gate green)
- ✅ `@multivrs/config` (zod schema for `multivrs.json`), `@multivrs/error-utils`
  (typed errors → HTTP), `@multivrs/client` (typed API client + shared contract).
- ✅ Prisma `Project` / `Deployment` / `Domain` models (with production-alias
  pointer) + `prisma generate`.
- ✅ Control-plane API routes in `apps/web`: `GET|POST /api/projects`,
  `GET /api/projects/[id]`, `GET|POST /api/projects/[id]/deployments`, backed by
  `project.service.ts` / `deployment.service.ts`, auth-guarded, zod-validated.
- ✅ **Gate (`bun test`):** `test/config` parses valid/invalid `multivrs.json`
  fixtures; `test/client` round-trips create-project / create-deployment through a
  fake-fetch transport; `test/error-utils` checks the error→HTTP mapping.
- ✅ Neon schema applied on 2026-07-11; dashboard project/deployment reads now use
  Prisma services instead of the mock-data switch.

**Phase 1 — Deploy loop (Next.js + swift-rust)** — ✅ implemented
- ✅ Repository detection, package-manager detection, shared configuration, and
  content-addressed artifact creation/upload are implemented and tested.
- ✅ Full Next.js uses `@opennextjs/cloudflare` output, preserving SSR, route
  handlers, middleware, Server Actions, cookies, assets, and cache behavior.
- ✅ swift-rust is a first-class target: static/WASM routes go to R2 and SSR modes
  execute the packaged binary in the Cloudflare compute container.
- ✅ The Cloudflare build Worker uses Queues + Sandbox SDK containers, carries a
  Rust/Cargo/Bun toolchain, streams logs, uploads artifacts, retries infrastructure
  failures, and cleans up sandboxes. Local development keeps a direct runner.
- ✅ The serve Worker resolves preview/project/custom hostnames, serves R2 assets,
  and dispatches executable workloads through service/dynamic-dispatch bindings.
- ✅ The native Rust CLI supports auth, project linking, preview/production deploys,
  lifecycle/log updates, parallel hashing, deduplicated uploads, and promotion.
- ✅ Dashboard import/configure/deploy UI is connected to GitHub OAuth or a public
  repository URL, shows live build logs/status, supports cancellation, and routes
  successful deployments into the real project dashboard.

**Phase 2 — Edge & runtime** — ✅ implemented
- ✅ Route/redirect/rewrite/header matching exists in TypeScript and in the compiled
  Rust/WASM hot-path matcher used by the serve Worker.
- ✅ Edge middleware/runtime helpers, geolocation, R2 static delivery, immutable
  caching, Cloudflare Images on-demand optimization, and build-time media variants.
- ✅ Web Vitals injection and collection plus Analytics Engine request telemetry.
- ✅ Firewall evaluation, attack mode, bot/IP/country/header rules, and Cloudflare
  rate-limit binding enforcement run before origin/static delivery.

**Phase 3 — Platform services** — ✅ implemented
- ✅ Domains are account-owned and optionally connected to projects. Search/pricing,
  multi-item cart, saved domains, Stripe custom checkout, webhook fulfillment,
  OpenProvider registration/DNS, renewal dates, and real domain detail routes work.
- ✅ Cloudflare custom-hostname certificate provisioning and verification details
  are persisted and exposed in the dashboard.
- ✅ Logs, Analytics, Speed Insights, and Observability pages read actual deployment
  and Cloudflare data with loading, empty, success, and error states.
- ✅ Firewall, CDN/cache, encrypted environment variables, DNS, and Email Routing
  have authenticated APIs, service layers, validation, and operational dashboard UI.
- ✅ The missing `saved_domains` migration was added; both configured Neon branches
  were baselined and all Phase 3–5 migrations were applied successfully on
  2026-07-26. Prisma CLI now loads `.env.local` first to match Next.js locally.

**Phase 4 — Expansion** — ✅ implemented
- ✅ Framework catalog/build output support covers Next.js, swift-rust, Remix, Hono,
  h3, Node/Bun, Go, Python, Ruby, Vite, and static sites.
- ✅ Hono and h3 adapters, MCP adapter, short-lived OIDC project tokens, and
  Cloudflare Sandbox management APIs/dashboard are implemented.
- ✅ Container runtime selection and entrypoints are validated at the request
  boundary; fixture builders produce valid content-addressed artifacts.

**Phase 5 — Dashboard and production readiness** — ✅ implemented
- ✅ Responsive desktop/mobile dashboard shell, project search/filter/layout,
  deployment filtering, live project overview, and framework-aware project settings.
- ✅ Account profile editing, API tokens, destructive project deletion, account
  usage, audit activity, persistent notifications, read/archive actions, and health
  readiness endpoint.
- ✅ Production project/deployment paths no longer use mock-data switches; structured
  logging replaces application `console` calls in the implemented control plane.
- ✅ Zod validates new API/provider boundaries, DB access stays in services, new UI
  modules comply with the 150-line split rule, and the repository Biome gate is green.
- ✅ Gates: 96 Bun feature/integration tests, 17 Rust tests, Rust clippy with warnings
  denied, 24-workspace TypeScript checks, Prisma generation/migration status,
  React Doctor with zero errors, a 54-page Next.js production build, and
  serve/build/compute Worker dry-runs.
- ⏳ **Go-live operations (external, not source-code work):** publish the three
  Workers and queues/bindings, build/push both container images with Docker running,
  add production Cloudflare/Stripe/OpenProvider secrets, configure Stripe webhooks,
  then run one real repository deploy and one low-cost domain purchase smoke test.

---

## 7. Resolved architecture decisions

1. ✅ **swift-rust:** consume its external toolchain and deploy its declared
   artifact contract; Multivrs owns the builder/runtime integration.
2. ✅ **Edge/data plane:** Cloudflare Workers, Workers for Platforms dynamic
   dispatch, service bindings, and Containers instead of a self-managed Go fleet.
3. ✅ **Artifacts:** content-addressed manifests/blobs in Cloudflare R2.
4. ✅ **Build isolation:** Cloudflare Sandbox SDK containers with one isolated
   sandbox per deployment job.
5. ✅ **Routing:** readable TypeScript control logic plus Rust/WASM matching on the
   request hot path.

---

## 8. Local development & test workflow

All commands run from the **repo root** (Turborepo orchestrates workspaces; `bun`
only — never npm/pnpm/yarn).

| Command | What it does |
|---|---|
| `bun dev` | Run **web + convex together** (`turbo run dev` across workspaces). |
| `bun dev:web` | Run only the Next.js dashboard (`apps/web` → `next dev`). |
| `bun dev:convex` | Run only the Convex backend (`@repo/backend` → `convex dev`). |
| `bun test` | Run the phase-gate tests in [`/test`](../../test). |
| `bun run test:all` | Run every workspace's own `test` task (`turbo run test`). |
| `bun run build` / `lint` / `check-types` | Turbo-orchestrated across workspaces. |
| `bun run format` / `check` | Biome write / check across the repo. |

**Test after each phase (the gate).** Tests are **feature/integration tests**,
modeled on [`vercel/vercel/test`](https://github.com/vercel/vercel/tree/main/test):
import the real feature and run it against **fixtures**, then assert behavior —
*not* assertions about repo shape. Vercel's pattern:

- `test/<feature>/index.test.js` imports the feature and runs it against fixture
  dirs (e.g. `determine-turbo-hit-or-miss/{hit,miss}/` → assert miss count).
- `test/lib/deployment/` holds shared helpers that **actually deploy a fixture**
  and probe the result (`test-deployment.js`, `now-deploy.js`).

Our layout mirrors this:
```
test/
  lib/            shared helpers (deploy a fixture, build a fixture, http probes)
  fixtures/       sample apps/inputs per feature (a tiny Next app, a swift-rust app, …)
  <feature>/      index.test.ts that runs the feature against fixtures
```

A phase is **not "done"** until its features have such tests and `bun test` is
green (earlier phases must not regress). Examples of what we actually assert:
detection picks the right framework for a fixture; a fixture app **builds to a
content-addressed artifact**; the proxy **serves a deployment**; **bot protection**
blocks a flagged request. Package-local unit tests may also live in the package
(run via `bun run test:all`).

---

*Sources: github.com/vercel/vercel/tree/main/packages (live package list),
swift-rust-self.vercel.app, docs-swift-rust.vercel.app.*
