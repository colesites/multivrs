# MULTIVRS Platform — Build & Deploy Engineering Plan

> Status: **Draft v1** · Owner: Cole · Scope: the deployment platform behind the
> dashboard (`apps/web`). This is the backend/services plan — not the UI.
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

**Target platform packages** (added across the phases in §6):
```
packages/
  build-utils/         (TS)   shared build helpers, artifact packaging
  fs-detectors/        (TS)   framework / pkg-manager / monorepo detection
  frameworks/          (TS)   framework preset catalog
  routing-utils/       (TS)   route/redirect/rewrite/header rule engine
  config/              (TS)   vercel.json-equivalent schema (zod) + types
  client/              (TS)   typed platform API client (used by CLI + dashboard)
  error-utils/         (TS)   typed errors
  functions-runtime/   (TS)   @multivrs/functions runtime helpers
  edge/                (TS)   edge middleware primitives
  builder-next/        (TS)   Next.js builder
  builder-swift-rust/  (TS)   swift-rust builder (drives the Rust/Bun toolchain)
  firewall/            (TS)   WAF rule schema + control-plane API

  cli/                 (Rust) native single-binary CLI  (see §5)
  proxy/               (Go)   request data plane / edge router / TLS  (see §5)
  builder-core/        (Rust) hashing, upload, sandbox exec, asset optimizer (§2.3)
  swift-rust/          (Rust+Bun) our framework (separate repo today; vendored target)
```

`apps/`
```
apps/web/    Next.js dashboard + platform control-plane API (this app)
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

**Phase 1 — Deploy loop (Next.js + swift-rust)** — 🚧 static loop complete; compute remains
- ✅ **detect** — `@multivrs/frameworks` (preset catalog) + `@multivrs/fs-detectors`
  (`DetectorFilesystem`/`LocalFilesystem`, `detectFramework`/`detectPackageManager`/
  `detectProject`). Detects nextjs / swift-rust / vite / static + bun/pnpm/yarn/npm.
- ✅ **artifact** — `@multivrs/build-utils` `createArtifact(dir)` → content-addressed
  manifest (sha256 per file, deterministic `artifactHash`).
- ✅ **upload** — `LocalArtifactStore` + production `R2ArtifactStore`; the CLI uses
  prepare → concurrent missing-blob PUTs → verified completion, so uploads stream
  per file and dedupe by content hash. Live R2 upload/read/delete smoke test passed.
- ✅ **runtime model** — `@multivrs/functions`: runtime = **bun (default)** / node /
  edge (swift-rust uses all three), `resolveRuntime`/`isRuntime`/`toFunctionConfig`;
  `runtime` added to the `multivrs.json` schema.
- ✅ **build** — `@multivrs/static-build` (resolve settings + run install/build
  via injectable runner) and the two framework builders:
  - `@multivrs/builder-next` — runs `next build`, reads `routes-manifest.json`,
    maps static routes → CDN, dynamic → one SSR `render` function (node). Bounded
    v1 mapping.
  - `@multivrs/builder-swift-rust` — runs the swift-rust toolchain, reads its
    build manifest (`multivrs-build.json`, a contract we own), maps per-route mode:
    `wasm` → static (no compute), `ssr*` → invoke the binary (bun default).
  Both produce the shared `BuildOutput` (`build-utils`); the actual toolchain
  invocation is injectable, so tests run against fixture outputs (no real build).
- ✅ **CLI** — Rust workspace (root `Cargo.toml`, crates under `packages/`): `cli`
  (`multivrs` binary: `login`/`logout`/`whoami`/`link`/`deploy`), `cli-auth`
  (token store at `~/.multivrs/auth.json`, 0600), `cli-config` (`.multivrs/project.json`
  linking). `deploy` now creates lifecycle rows before building, records logs/failures,
  builds, hashes, uploads, and atomically promotes successful `--prod` deployments.
- ✅ **builder core** — Rust `builder-core` owns parallel SHA-256 hashing and
  content-addressed packaging. The CLI maps static/Vite/Next exports and
  `multivrs-build.json` into the shared `BuildOutput` contract.
- ✅ **static serve** — `apps/serve-worker` resolves preview/project/custom hostnames,
  reads manifests/blobs through an R2 binding, handles clean paths/SPA fallback and
  immutable caching, and forwards function routes through a `COMPUTE` service binding.
  Wrangler dry-run passed (1.59 KiB gzip).
- ✅ **dashboard/lifecycle** — live projects/deployments, queued → building →
  ready/error/canceled transitions, build timestamps/errors/logs, log detail page,
  copy URL and cancel actions, and production-alias status.
- ✅ **Gate:** 69 Bun tests, 14 Rust tests + clippy, all workspace type checks,
  production Next build, Worker dry-run, React Doctor 100/100, Neon schema push,
  live R2 upload/read/delete smoke, auth-page browser smoke, and a reversible full
  CLI → API → lifecycle/logs → upload → production promotion → served HTML E2E.
- ⏳ **compute** — provision/deploy the OpenNext Worker for Next SSR/route handlers and
  define the executable WASM ABI/worker for swift-rust `ssr*`. R2 cannot execute an
  uploaded worker or native binary; the serve worker's `COMPUTE` binding is the handoff.
- ✅ **build-time asset optimizer** — Rust `builder-core` creates WebP images in
  parallel, WebM video through ffmpeg, and WOFF2 fonts through pyftsubset when the
  optional tools are installed. The CLI logs created/skipped variants before
  hashing, and the serve Worker negotiates image/video variants via `Accept`.
  Native image, real ffmpeg, missing-tool, resolver, type-check and Worker dry-run
  tests pass. On-demand `/_image` resizing remains a Phase 2 edge capability.

> **Infra prerequisite:** R2 is configured and tested. Worker publication and a full
> E2E against your account requires `CLOUDFLARE_API_TOKEN`,
> `MULTIVRS_DEPLOYMENT_DOMAIN`, and `MULTIVRS_SERVE_TOKEN`. CLI credentials are
> user-scoped, hashed database tokens created from dashboard developer settings;
> no production user ID or shared API token is stored in the environment.

**Phase 2 — Edge & runtime** — 🚧 TS engines done
- ✅ `@multivrs/functions` (runtime model), `@multivrs/edge` (middleware
  primitives + geo), `@multivrs/routing-utils` (route/redirect/rewrite/header
  engine). Tested: `test/routing-utils`, `test/edge`, `test/functions`.
- ⏳ compile the routing matcher to Rust/WASM for the proxy hot path.

**Phase 3 — Platform services** — 🚧 firewall control plane done
- ✅ `@multivrs/firewall` control plane: rule schema + `evaluateFirewall`
  (allow/deny/challenge/rate_limit; ip/path/method/country/header/user-agent).
  Tested: `test/firewall` (incl. bot protection + rate-limit modeling).
- ⏳ Go enforcement; Domains/DNS/certs (pricing engine); Logs, Analytics, Speed
  Insights, Observability — the sidebar sections, now backed.
- **Gate (added as each lands):** pricing engine (`retail = roundTo99(...)`) on
  TLD fixtures; analytics/log ingest round-trips.

**Phase 4 — Expansion**
- More builders (`node`, `go`, `python`, `ruby`, `remix`…), framework adapters
  (`hono`, `h3`), OIDC, MCP, Sandboxes.
- **Gate:** each new builder produces a valid artifact for its fixture app.

---

## 7. Open decisions
1. **Repo for `swift-rust`** — vendor as a workspace package vs. consume as an
   external toolchain the builder shells out to?
2. **Proxy hosting** — self-managed Go fleet vs. a managed edge (Cloudflare
   Workers / Fly) for v1?
3. **Artifact store** — content-addressed blobs in Vercel Blob / S3 / Neon-backed?
4. **Sandbox** — Firecracker-style microVMs (à la Vercel Sandbox) vs. containers
   for untrusted builds?
5. **How much of `routing-utils` runs at the edge** in v1 (TS in proxy vs.
   Rust/WASM from day one)?

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
