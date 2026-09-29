// Side-effect stylesheet imports (e.g. `import "./globals.css"`) are compiled
// by swift-rust; this lets TypeScript accept them.
declare module "*.css";

// Server-side env access (build-time prerender runs on Bun). Kept minimal so
// the app doesn't need @types/node.
declare const process: { env: Record<string, string | undefined> };
