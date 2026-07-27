# Multivrs Cloudflare build worker

Production builds are queued in Cloudflare Queues and executed in isolated
Cloudflare Sandbox containers. Each deployment gets an ephemeral filesystem,
checks out its GitHub repository, runs the Rust `multivrs` CLI, uploads the
content-addressed artifact to R2 through the control-plane API, and is destroyed.

## Cloudflare setup

Sandbox SDK and Containers require the Workers Paid plan and Docker during
deployment. Create the queues once:

```sh
bunx wrangler queues create multivrs-builds
bunx wrangler queues create multivrs-builds-dead
```

Set the Worker authentication secret:

```sh
bunx wrangler secret put BUILD_WORKER_TOKEN
```

With Docker running, deploy from the repository root:

```sh
bun run deploy:build-worker
```

Add the following to `apps/web` in Vercel:

```text
CLOUDFLARE_BUILD_WORKER_URL=https://multivrs-build.<account>.workers.dev
CLOUDFLARE_BUILD_WORKER_TOKEN=<same secret as BUILD_WORKER_TOKEN>
```

The Worker receives only authenticated job submissions. User build variables
are scoped to the sandbox command. GitHub OAuth credentials are used only for
checkout and the authenticated remote is removed before install/build scripts
run. A short-lived Multivrs API token reports logs and uploads; it is revoked at
the end of the build.

## Local development

Without the two Cloudflare environment variables, non-production `apps/web`
uses the local runner. Production intentionally fails closed instead of running
untrusted builds inside a Vercel function.
