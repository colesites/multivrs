# Multivrs serve worker

The Worker resolves an incoming hostname through the web control plane, reads
the immutable deployment manifest and blobs from R2, and forwards function
routes through the optional `COMPUTE` service binding.

Required configuration:

- `ARTIFACTS`: R2 binding using the same bucket as `R2_BUCKET_NAME` in `apps/web`.
- `CONTENT`: R2 binding using the same bucket as `R2_CONTENT_BUCKET_NAME` in `apps/web`.
- `RUNTIME_CONFIG`: KV namespace containing versioned redirects, Edge Config,
  cache tags, and microfrontend mounts.
- `REVALIDATION_QUEUE`: Queue used for background ISR regeneration.
- `CACHE_COORDINATOR`: Durable Object namespace that prevents duplicate regeneration.
- `CONTROL_PLANE_URL`: deployed `apps/web` origin.
- `CONTROL_PLANE_TOKEN`: Wrangler secret matching `MULTIVRS_SERVE_TOKEN`.
- `BLOB_SIGNING_SECRET`: Wrangler secret matching
  `MULTIVRS_BLOB_SIGNING_SECRET` in `apps/web`.
- `MULTIVRS_DEPLOYMENT_DOMAIN`: set in `apps/web` to the wildcard deployment domain.

Set the Worker secret with:

```sh
bunx wrangler secret put CONTROL_PLANE_TOKEN
bunx wrangler secret put BLOB_SIGNING_SECRET
```

Compile without deploying:

```sh
bun run deploy:serve:dry
```

Deploy after setting `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`:

```sh
bun run deploy:serve
```

The deployment command also applies `r2-cors.json` to the content bucket so
browser uploads can PUT directly to their short-lived signed R2 URL. Keep the
web application's `CLOUDFLARE_RUNTIME_KV_NAMESPACE_ID` pointed at the same
namespace Wrangler provisions for the `RUNTIME_CONFIG` binding.

## Application cache API

Deployed functions can opt into Multivrs ISR and stale-while-revalidate through
`@multivrs/functions`:

```ts
import { withMultivrsCache } from "@multivrs/functions";

return withMultivrsCache(Response.json(data), {
  revalidate: 60,
  staleWhileRevalidate: 300,
  tags: ["products"],
});
```

Invalidate all cached function responses—or only one tag—through the
authenticated `POST /api/projects/:id/content/revalidate` endpoint. Dashboard
sessions and Multivrs bearer API tokens are both accepted.

The wildcard deployment hostname must be proxied to this Worker. Verified
custom domains are resolved through the same control-plane endpoint.

## Compute binding

R2 only stores deployment files. Dynamic routes are forwarded to a separately
deployed Worker through Cloudflare's `COMPUTE` service binding. Without that
binding, standalone Next.js Node deployments use the control plane's compute
fallback, which keeps SSR and route handlers functional during local testing
and initial production rollout. The dedicated binding remains the scale-out
path. Its target Worker must exist before adding this binding to `wrangler.toml`:

```toml
[[services]]
binding = "COMPUTE"
service = "multivrs-compute"
```

For Next.js, OpenNext produces the target Worker at `.open-next/worker.js`; deploy
that Worker as `multivrs-compute`. For swift-rust SSR, the target must be a
Cloudflare Worker containing the renderer compiled to WASM and implementing the
request/header contract used in `src/index.ts`. Native Rust executables cannot run
inside a Cloudflare Worker.

The static binding above is suitable for the Phase 1 single compute dispatcher.
A multi-tenant production implementation should use Workers for Platforms dynamic
dispatch or make `multivrs-compute` dispatch by `x-multivrs-deployment`.

## Asset variants

The Rust builder creates adjacent WebP and WebM variants before hashing/uploading.
This Worker negotiates those variants through the request `Accept` header. Font
conversion creates adjacent WOFF2 files when `pyftsubset` is installed; CSS must
reference those files explicitly, so fonts are never substituted at request time.
