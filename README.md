# Multivrs 🌐

> A modern, serverless edge deployment platform. Connect a repo, and we'll detect the framework, build it, optimize assets, and serve them globally on the edge.

Multivrs is a Vercel-class deployment platform designed for high-performance edge computing. It provides first-class support for Next.js as well as our own `swift-rust` framework. 

## ✨ Key Features

- **Global Edge Network**: Deploy your code to a global edge network powered by Cloudflare Workers.
- **Smart Framework Detection**: Automatically detects your framework, package manager, and monorepo setup.
- **Advanced Asset Optimization**: Lossless and perceptually lossless asset optimization running at build-time (images, fonts, video, minification) using Rust.
- **Instant Rollbacks**: Every deploy is immutable. Rollbacks are instant alias pointer flips, with no rebuilds required.
- **Built-in Services**: 
  - Free custom domains with automatic DNS/TLS configuration.
  - Analytics and speed insights.
  - Edge logging and observability.
  - Platform firewall and bot protection.
  - Email routing and forwarding out of the box.

## 🏗️ System Architecture

Multivrs is cleanly separated into three core planes:

| Plane | Purpose | Technology |
|---|---|---|
| **Control Plane** | System of record for users, teams, projects, deploys, and domains (Metadata) | **Neon (Postgres)** via Prisma |
| **Real-time Layer** | Live projection for dashboard updates (deploy status, notifications) | **Convex** |
| **Artifact Storage** | Immutable, content-addressed storage for build outputs | **Cloudflare R2** |
| **Compute Engine** | Executes SSR, functions, and binaries per request | **Cloudflare Workers** / Fly.io |

For a deep dive into the architecture, asset optimization pipeline, and pricing engine, check out [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🗂️ Monorepo Structure

Multivrs is a monorepo managed with **Bun** and **Turborepo**.

```text
multivrs/
├── apps/
│   ├── build-worker/     # Compiles and optimizes user projects
│   ├── compute-worker/   # Runs edge compute workloads
│   ├── mail-inbound/     # Webhook handler for incoming mail (Resend)
│   ├── mail-smtp/        # Outbound SMTP service
│   ├── mail-worker/      # Mail delivery worker queue
│   ├── serve-worker/     # Serves apps, sites, and static assets
│   └── web/              # The main Multivrs Dashboard (Next.js)
├── packages/
│   ├── backend/          # Convex real-time layer
│   ├── builder-*/        # Builders for Next.js, swift-rust, etc.
│   ├── cli/              # Single-binary deploy CLI (Rust)
│   ├── config/           # Shared multivrs.json schema and types
│   ├── fs-detectors/     # Framework/repo detectors
│   ├── routing-utils/    # Routing rules and matcher
│   └── ...               # Additional shared utilities
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Bun](https://bun.sh/) (v1.3.5 or latest)
- [Rust & Cargo](https://rustup.rs/) (for CLI and Rust-based builders)
- Node.js (v18+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/multivrs.git
   cd multivrs
   ```

2. **Install dependencies:**
   We strictly use `bun` for package management.
   ```bash
   bun install
   ```

3. **Environment Setup:**
   Copy the example environment files and fill in your keys (Neon DB, Convex, Resend, Stripe, Sanity, etc.).
   ```bash
   cp .env.example .env
   # Ensure you also configure apps/web/.env and packages/backend/.env.local
   ```

### Running Locally

You can spin up the entire stack using Turbo:

```bash
# Start the Next.js Dashboard
bun dev:web

# Start the Convex real-time backend
bun dev:convex

# Or run the entire suite
bun dev
```

### Database Management

Multivrs uses Prisma with Neon Postgres. To manage your database schemas:

```bash
cd apps/web
bunx prisma generate
bunx prisma db push  # or migrate dev
```

## 🛠️ Tech Stack

We follow a strict language strategy:
- **TypeScript**: The default for the dashboard (`web`), API, configuration, client, and routing.
- **Rust**: Used for CPU-bound tasks like the CLI, `builder-core` (hashing, asset optimization), and swift-rust render core.
- **Go**: Handles the network data plane, proxying, TLS, and log ingestion.
- **Bun**: Our monorepo package manager, test runner, and local development runtime.

## 📄 License

This project is proprietary and confidential. All rights reserved.
