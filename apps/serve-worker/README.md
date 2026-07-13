# Multivrs serve worker

The Worker resolves an incoming hostname through the web control plane, reads
the immutable deployment manifest and blobs from R2, and forwards function
routes through the optional `COMPUTE` service binding.

Required configuration:

- `ARTIFACTS`: R2 binding using the same bucket as `R2_BUCKET_NAME` in `apps/web`.
- `CONTROL_PLANE_URL`: deployed `apps/web` origin.
- `CONTROL_PLANE_TOKEN`: Wrangler secret matching `MULTIVRS_SERVE_TOKEN`.
- `MULTIVRS_DEPLOYMENT_DOMAIN`: set in `apps/web` to the wildcard deployment domain.

Set the Worker secret with:

```sh
bunx wrangler secret put CONTROL_PLANE_TOKEN
```

Compile without deploying:

```sh
bun run deploy:serve:dry
```

Deploy after setting `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`:

```sh
bun run deploy:serve
```

The wildcard deployment hostname must be proxied to this Worker. Verified
custom domains are resolved through the same control-plane endpoint.

## Compute binding

R2 only stores deployment files. Dynamic routes are forwarded to a separately
deployed Worker through Cloudflare's `COMPUTE` service binding. The target Worker
must exist before adding this binding to `wrangler.toml`:

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
