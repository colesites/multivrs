import { Container } from "@cloudflare/containers";
import type { RuntimeRequest } from "./request";

const APP_ROOT = "/runtime/app";
const PORT = 8080;
type RuntimeState = Pick<RuntimeRequest, "artifactHash" | "entrypoint" | "environment" | "runtime">;

export class SwiftRustContainer extends Container {
  defaultPort = PORT;
  sleepAfter = "10m";
  enableInternet = false;

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

  private async startRuntime(state: RuntimeState): Promise<void> {
    const executable = `${APP_ROOT}/${state.entrypoint}`;
    const command = runtimeCommand(state.runtime, executable);
    const process = await this.runtime.exec(command, {
      cwd: APP_ROOT,
      env: {
        ...state.environment,
        BUNDLE_GEMFILE: `${APP_ROOT}/Gemfile`,
        BUNDLE_PATH: `${APP_ROOT}/vendor/bundle`,
        HOST: "0.0.0.0",
        MULTIVRS: "1",
        PORT: String(PORT),
        PYTHONPATH: `${APP_ROOT}/vendor`,
      },
      stdout: "ignore",
      stderr: "ignore",
    });
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

function runtimeCommand(runtime: RuntimeState["runtime"], entrypoint: string): string[] {
  if (runtime === "node") return ["node", entrypoint];
  if (runtime === "python") return ["python3", entrypoint];
  if (runtime === "ruby") return ["bundle", "exec", "ruby", entrypoint];
  if (runtime === "bun" && /\.[cm]?[jt]sx?$/.test(entrypoint)) return ["bun", entrypoint];
  return [entrypoint];
}
