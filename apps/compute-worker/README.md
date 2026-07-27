# Multivrs compute worker

Runs native Swift-Rust SSR binaries in isolated Cloudflare Containers. The serve
Worker resolves a function entrypoint to its content-addressed R2 blob and calls
this Worker through the private `COMPUTE` service binding. A Durable Object owns
one sleeping container per deployment; the binary is streamed directly from R2
over RPC, so no public artifact URL or registry credential reaches user code.

Deploy after Docker is running:

```sh
bun run deploy:compute
```

The Worker is deliberately not published on `workers.dev`. Requests arrive only
from the serve Worker binding. Scale `max_instances` in `wrangler.toml` to match
the account's Cloudflare Containers allocation.
