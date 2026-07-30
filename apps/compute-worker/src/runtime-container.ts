import { Container } from "@cloudflare/containers";
import type { RuntimeRequest } from "./request";
import type { Env } from "./types";

const APP_ROOT = "/runtime/app";
const PORT = 8080;
type RuntimeState = Pick<
  RuntimeRequest,
  "artifactHash" | "deploymentId" | "entrypoint" | "environment" | "runtime"
>;
type RuntimeLogLine = { level: "info" | "error"; message: string };

export class SwiftRustContainer extends Container<Env> {
  defaultPort = PORT;
  sleepAfter = "10m";
  enableInternet = false;
  private flushPromise?: Promise<void>;

  async ensureRuntime(state: RuntimeState): Promise<boolean> {
    await this.ensureContainer();
    const current = await this.ctx.storage.get<RuntimeState>("runtimeState");
    const pid = await this.ctx.storage.get<number>("runtimePid");
    if (JSON.stringify(current) !== JSON.stringify(state) || !pid || !(await this.isAlive(pid))) {
      return false;
    }
    await this.waitForPort({ portToCheck: PORT, retries: 4, waitInterval: 100 });
    return true;
  }

  async prepareRuntime(): Promise<void> {
    await this.ensureContainer();
    await this.stopRuntime();
    const cleaned = await this.runtime.exec(
      ["sh", "-c", 'find "$1" -mindepth 1 -delete', "sh", APP_ROOT],
      { stdout: "ignore", stderr: "ignore" },
    );
    if ((await cleaned.exitCode) !== 0) throw new Error("Could not clear the runtime directory");
  }

  async installFile(path: string, body: ReadableStream<Uint8Array>): Promise<void> {
    const destination = `${APP_ROOT}/${path}`;
    const upload = await this.runtime.exec(
      ["sh", "-c", 'mkdir -p "$(dirname "$1")" && tee "$1"', "sh", destination],
      { stdin: body, stdout: "ignore", stderr: "ignore" },
    );
    if ((await upload.exitCode) !== 0) throw new Error(`Could not install ${path}`);
  }

  async activateRuntime(state: RuntimeState): Promise<void> {
    const executable = `${APP_ROOT}/${state.entrypoint}`;
    const chmod = await this.runtime.exec(["chmod", "0555", executable], { stdout: "ignore" });
    if ((await chmod.exitCode) !== 0) throw new Error("Runtime entrypoint is missing");
    await this.startRuntime(state);
  }

  async flushRuntimeLogs(): Promise<void> {
    if (this.flushPromise) return this.flushPromise;
    this.flushPromise = this.flushRuntimeLogsOnce().finally(() => {
      this.flushPromise = undefined;
    });
    return this.flushPromise;
  }

  private async startRuntime(state: RuntimeState): Promise<void> {
    const executable = `${APP_ROOT}/${state.entrypoint}`;
    const command = runtimeCommand(state.runtime, executable);
    const process = await this.runtime.exec(
      [
        "sh",
        "-c",
        'exec "$@" >> "$MULTIVRS_STDOUT_LOG" 2>> "$MULTIVRS_STDERR_LOG"',
        "sh",
        ...command,
      ],
      {
        cwd: APP_ROOT,
        env: {
          ...state.environment,
          BUNDLE_GEMFILE: `${APP_ROOT}/Gemfile`,
          BUNDLE_PATH: `${APP_ROOT}/vendor/bundle`,
          HOST: "0.0.0.0",
          MULTIVRS: "1",
          MULTIVRS_STDERR_LOG: "/tmp/multivrs-runtime.stderr",
          MULTIVRS_STDOUT_LOG: "/tmp/multivrs-runtime.stdout",
          PORT: String(PORT),
          PYTHONPATH: `${APP_ROOT}/vendor`,
        },
        stdout: "ignore",
        stderr: "ignore",
      },
    );
    await this.ctx.storage.put("runtimePid", process.pid);
    await this.ctx.storage.put("runtimeState", state);
    await this.waitForPort({ portToCheck: PORT, retries: 60, waitInterval: 250 });
  }

  private async stopRuntime(): Promise<void> {
    const pid = await this.ctx.storage.get<number>("runtimePid");
    if (pid && (await this.isAlive(pid))) {
      await this.runtime.exec(["kill", String(pid)], { stdout: "ignore" });
    }
    await this.ctx.storage.delete("runtimePid");
    await this.ctx.storage.delete("runtimeState");
  }

  private async flushRuntimeLogsOnce(): Promise<void> {
    const state = await this.ctx.storage.get<RuntimeState>("runtimeState");
    if (!state || !this.runtime.running) return;
    const [stdout, stderr] = await Promise.all([
      this.drainLogFile("/tmp/multivrs-runtime.stdout"),
      this.drainLogFile("/tmp/multivrs-runtime.stderr"),
    ]);
    const pending = await this.ctx.storage.get<RuntimeLogLine[]>("pendingRuntimeLogs");
    const logs = [
      ...(pending ?? []),
      ...toLogLines(stdout, "info"),
      ...toLogLines(stderr, "error"),
    ].slice(-200);
    if (!logs.length) return;
    await this.ctx.storage.put("pendingRuntimeLogs", logs);
    const endpoint = new URL("/api/runtime/logs", this.env.CONTROL_PLANE_URL);
    const headers = new Headers({ "content-type": "application/json" });
    if (this.env.CONTROL_PLANE_TOKEN) {
      headers.set("authorization", `Bearer ${this.env.CONTROL_PLANE_TOKEN}`);
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ deploymentId: state.deploymentId, logs }),
    });
    if (!response.ok) throw new Error(`Runtime log ingestion returned ${response.status}`);
    await this.ctx.storage.delete("pendingRuntimeLogs");
  }

  private async drainLogFile(path: string): Promise<string> {
    const process = await this.runtime.exec(
      ["sh", "-c", 'test -f "$1" && tail -c 262144 "$1"; : > "$1"', "sh", path],
      { stdout: "pipe", stderr: "ignore" },
    );
    const output = await process.output();
    return new TextDecoder().decode(output.stdout);
  }

  private async ensureContainer(): Promise<void> {
    if (!this.runtime.running) await this.start({ enableInternet: false });
  }

  private async isAlive(pid: number): Promise<boolean> {
    const check = await this.runtime.exec(["kill", "-0", String(pid)], {
      stdout: "ignore",
      stderr: "ignore",
    });
    return (await check.exitCode) === 0;
  }

  private get runtime(): NonNullable<(typeof this.ctx)["container"]> {
    const runtime = this.ctx.container;
    if (!runtime) throw new Error("Cloudflare Container binding is unavailable");
    return runtime;
  }
}

function toLogLines(value: string, level: "info" | "error"): RuntimeLogLine[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((message) => ({ level, message: message.slice(0, 16_000) }));
}

function runtimeCommand(runtime: RuntimeState["runtime"], entrypoint: string): string[] {
  if (runtime === "node") return ["node", entrypoint];
  if (runtime === "python") return ["python3", entrypoint];
  if (runtime === "ruby") return ["bundle", "exec", "ruby", entrypoint];
  if (runtime === "bun" && /\.[cm]?[jt]sx?$/.test(entrypoint)) return ["bun", entrypoint];
  return [entrypoint];
}
