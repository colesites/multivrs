#!/usr/bin/env bun
/**
 * `vrs-pay push`: sends your vrs-pay.config.ts to VRS Pay. Safe to run on
 * every deploy; only what changed is written.
 *
 *   VRS_PAY_SECRET_KEY=sk_… VRS_PAY_API_URL=https://… vrs-pay push [--config ./vrs-pay.config.ts]
 *
 * Runs on Bun until the package ships built JavaScript.
 */
import { existsSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { VrsPay } from "./client";
import type { Fetch } from "./http";
import type { BillingConfig } from "./params";

const CANDIDATES = [
  "vrs-pay.config.ts",
  "vrs-pay.config.mts",
  "vrs-pay.config.js",
  "vrs-pay.config.mjs",
];

interface Io {
  cwd: string;
  env: Record<string, string | undefined>;
  log: (line: string) => void;
  fetch?: Fetch;
}

/** The config's default export (or `config` export). */
export async function loadConfig(cwd: string, path?: string): Promise<BillingConfig> {
  const file = path ? resolve(cwd, path) : CANDIDATES.map((c) => resolve(cwd, c)).find(existsSync);
  if (!file || !existsSync(file)) {
    throw new Error(`No config found. Add vrs-pay.config.ts or pass --config.`);
  }
  const module: { default?: BillingConfig; config?: BillingConfig } = await import(
    pathToFileURL(file).href
  );
  const config = module.default ?? module.config;
  if (!config) throw new Error(`${file} has no default export.`);
  return config;
}

/** Runs the CLI; returns the exit code. */
export async function runCli(args: string[], io: Io): Promise<number> {
  const { positionals, values } = parseArgs({
    args,
    allowPositionals: true,
    options: { config: { type: "string" } },
  });
  if (positionals[0] !== "push") {
    io.log("Usage: vrs-pay push [--config ./vrs-pay.config.ts]");
    return 1;
  }
  const secretKey = io.env.VRS_PAY_SECRET_KEY;
  const apiUrl = io.env.VRS_PAY_API_URL;
  if (!secretKey || !apiUrl) {
    io.log("Set VRS_PAY_SECRET_KEY and VRS_PAY_API_URL.");
    return 1;
  }
  try {
    const config = await loadConfig(io.cwd, values.config);
    const result = await new VrsPay(secretKey, { apiUrl, fetch: io.fetch }).billing.sync(config);
    if (!result.changed) {
      io.log("Nothing to change: VRS Pay already matches your config.");
      return 0;
    }
    for (const [label, items] of [
      ["Created", result.created],
      ["Updated", result.updated],
      ["Archived", result.archived],
    ] as const) {
      for (const item of items) io.log(`${label} ${item}`);
    }
    return 0;
  } catch (error) {
    io.log(`vrs-pay push failed: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

const entry = process.argv[1];
const invoked = entry && existsSync(entry) ? pathToFileURL(realpathSync(entry)).href : "";
if (import.meta.url === invoked) {
  const log = (line: string) => process.stdout.write(`${line}\n`);
  process.exitCode = await runCli(process.argv.slice(2), {
    cwd: process.cwd(),
    env: process.env,
    log,
  });
}
