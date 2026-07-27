import { resolve } from "node:path";

const workspace = resolve(import.meta.dir, "../../..");
const build = Bun.spawn(
  [
    "cargo",
    "build",
    "--locked",
    "-p",
    "routing-matcher-wasm",
    "--target",
    "wasm32-unknown-unknown",
    "--release",
  ],
  { cwd: workspace, stderr: "inherit", stdout: "inherit" },
);
const exitCode = await build.exited;
if (exitCode !== 0) {
  throw new Error(`Routing matcher build failed with exit code ${exitCode}`);
}
const source = Bun.file(
  resolve(workspace, "target/wasm32-unknown-unknown/release/routing_matcher_wasm.wasm"),
);
await Bun.write(resolve(import.meta.dir, "../src/routing-matcher.wasm"), source);
