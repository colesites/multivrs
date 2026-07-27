/**
 * The framework catalog, in detection priority order. More specific frameworks
 * come first; `static` is the fallback (a bare `index.html` with no toolchain).
 *
 * Next.js is transformed with OpenNext so its full Node runtime surface can
 * execute on Cloudflare Workers, rather than being reduced to a static export.
 */
import type { Framework } from "./types";

export const FRAMEWORKS: readonly Framework[] = [
  {
    id: "nextjs",
    name: "Next",
    signals: [{ dependency: "next" }],
    build: {
      buildCommand: "bunx @opennextjs/cloudflare build",
      outputDirectory: ".open-next",
      devCommand: "next dev",
    },
  },
  {
    id: "swift-rust",
    name: "swift-rust",
    signals: [
      { dependency: "swift-rust" },
      { file: "swift-rust.config.ts" },
      { file: "swift-rust.config" },
    ],
    build: {
      buildCommand: "bunx swift-rust build",
      outputDirectory: "dist",
      devCommand: "bunx swift-rust dev",
    },
  },
  {
    id: "remix",
    name: "Remix",
    signals: [{ dependency: "@remix-run/dev" }, { file: "remix.config.ts" }],
    build: {
      buildCommand:
        "bun run build && mkdir -p .multivrs-output/client && bun build build/server/index.js --target=bun --outfile .multivrs-output/server.js && cp -R build/client/. .multivrs-output/client",
      outputDirectory: ".multivrs-output",
      devCommand: "bunx remix vite:dev",
    },
  },
  {
    id: "hono",
    name: "Hono",
    signals: [{ dependency: "hono" }],
    build: {
      buildCommand:
        "mkdir -p .multivrs-output && bun build server.ts --target=bun --outfile .multivrs-output/server.js",
      outputDirectory: ".multivrs-output",
      devCommand: "bun run server.ts",
    },
  },
  {
    id: "h3",
    name: "h3",
    signals: [{ dependency: "h3" }],
    build: {
      buildCommand:
        "mkdir -p .multivrs-output && bun build server.ts --target=bun --outfile .multivrs-output/server.js",
      outputDirectory: ".multivrs-output",
      devCommand: "bun run server.ts",
    },
  },
  {
    id: "vite",
    name: "Vite",
    signals: [{ dependency: "vite" }, { file: "vite.config.ts" }, { file: "vite.config" }],
    build: {
      buildCommand: "vite build",
      outputDirectory: "dist",
      devCommand: "vite",
    },
  },
  {
    id: "go",
    name: "Go",
    signals: [{ file: "go.mod" }],
    build: {
      buildCommand: "mkdir -p .multivrs-output && go build -o .multivrs-output/server .",
      outputDirectory: ".multivrs-output",
      devCommand: "go run .",
    },
  },
  {
    id: "python",
    name: "Python",
    signals: [{ file: "requirements.txt" }, { file: "pyproject.toml" }],
    build: {
      buildCommand:
        "mkdir -p .multivrs-output/vendor && python3 -m pip install -r requirements.txt --target .multivrs-output/vendor && cp app.py .multivrs-output/app.py",
      outputDirectory: ".multivrs-output",
      devCommand: "python3 app.py",
    },
  },
  {
    id: "ruby",
    name: "Ruby",
    signals: [{ file: "Gemfile" }],
    build: {
      buildCommand:
        "mkdir -p .multivrs-output && bundle config set path .multivrs-output/vendor/bundle && bundle install && cp app.rb Gemfile .multivrs-output/",
      outputDirectory: ".multivrs-output",
      devCommand: "bundle exec ruby app.rb",
    },
  },
  {
    id: "node",
    name: "Node.js",
    signals: [{ file: "server.ts" }, { file: "server.js" }],
    build: {
      buildCommand:
        "mkdir -p .multivrs-output && bun build server.ts --target=bun --outfile .multivrs-output/server.js",
      outputDirectory: ".multivrs-output",
      devCommand: "bun run server.ts",
    },
  },
  {
    id: "static",
    name: "Static",
    signals: [{ file: "index.html" }],
    build: { buildCommand: null, outputDirectory: ".", devCommand: null },
  },
] as const;
