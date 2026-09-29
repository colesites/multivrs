# vrs-pay

Built with [swift-rust](https://swift-rust.dev) — the React framework powered with Rust + Bun. 10x faster than Next.js.

## Scripts

- `bun run dev` — start the dev server
- `bun run build` — build for production
- `bun run start` — start the production server
- `bun run lint` — run the linter
- `bun run typecheck` — run TypeScript checks (if TS)
- `bun run test` — run tests
- `bun run format` — format the code

## Project structure

 ```
src/
  app/
    layout.tsx
    page.tsx
    not-found.tsx
  components/
  lib/
```

## Learn more

- [Documentation](https://docs-swift-rust.vercel.app/)
- [Examples](https://github.com/colesites/swift-rust/tree/main/examples)
- [Discord](https://discord.gg/swift-rust)

## Deploy to Vercel

The fastest way to deploy is to push to GitHub and import the repo on Vercel:

```bash
git init && git add -A && git commit -m "init"
git remote add origin https://github.com/you/vrs-pay.git
git push -u origin main
```

Then on [vercel.com/new](https://vercel.com/new), import the repo. No configuration needed — `vercel.json` is included. Your site will be live at `https://vrs-pay.vercel.app`.

For custom domains and ISR / serverless functions, see the [deploy guide](https://docs-swift-rust.vercel.app/docs/getting-started/deploying).
