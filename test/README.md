# Tests — phase gates

Feature/integration tests, modeled on
[`vercel/vercel/test`](https://github.com/vercel/vercel/tree/main/test): import
the **real** feature and run it against **fixtures**, then assert behavior. We do
not assert repo shape.

Run from the repo root:

```bash
bun test ./test        # or: bun test
```

## Layout

```
test/
  lib/         shared helpers (e.g. fake-fetch transport for the API client)
  fixtures/    sample inputs per feature (valid/invalid multivrs.json, …)
  <feature>/   index.test.ts that runs the feature against fixtures
```

## Phase gates

Each roadmap phase (see `apps/web/PLAN.md` §6) adds the feature tests proving its
deliverables; a phase is **done** only when `bun test` is green and earlier
phases have not regressed.

- **Phase 0 — Foundations:** `config/` (parse valid/invalid `multivrs.json`),
  `client/` (typed API round-trip via fake fetch), `error-utils/` (error→HTTP
  mapping).
- **Phase 1 — Deploy loop:** detection picks the right framework on a fixture
  app; a fixture builds to a content-addressed artifact; the proxy serves it.
  *(added when Phase 1 lands)*

Type-check the suite with `tsc -p test/tsconfig.json --noEmit`.
