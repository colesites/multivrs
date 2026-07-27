import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

interface CliRunner {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export async function assertReadableDirectory(
  directory: string,
): Promise<void> {
  await access(directory, constants.R_OK);
}

export function resolveWorkingDirectory(
  checkoutDirectory: string,
  configured?: string,
): string {
  const requested = configured?.trim() || ".";
  if (isAbsolute(requested)) {
    throw new Error("Root directory must be relative to the repository.");
  }
  const workingDirectory = resolve(checkoutDirectory, requested);
  const fromCheckout = relative(checkoutDirectory, workingDirectory);
  if (fromCheckout.startsWith("..") || isAbsolute(fromCheckout)) {
    throw new Error("Root directory must stay inside the repository.");
  }
  return workingDirectory;
}

export async function resolveCliRunner(): Promise<CliRunner> {
  if (process.env.MULTIVRS_CLI_PATH) {
    await access(process.env.MULTIVRS_CLI_PATH, constants.X_OK);
    return {
      command: process.env.MULTIVRS_CLI_PATH,
      args: ["deploy", "--prod"],
    };
  }

  const workspaceRoot = await findWorkspaceRoot();
  for (const profile of ["release", "debug"] as const) {
    const binary = join(workspaceRoot, "target", profile, "multivrs");
    try {
      await access(binary, constants.X_OK);
      return { command: binary, args: ["deploy", "--prod"] };
    } catch {
      // Try the next local binary before falling back to Cargo.
    }
  }

  return {
    command: "cargo",
    args: [
      "run",
      "--manifest-path",
      join(workspaceRoot, "packages", "cli", "Cargo.toml"),
      "--",
      "deploy",
      "--prod",
    ],
    env: { RUSTUP_TOOLCHAIN: process.env.RUSTUP_TOOLCHAIN || "stable" },
  };
}

export function runCommand(
  command: string,
  args: string[],
  cwd: string,
  environment?: Record<string, string>,
): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const processHandle = spawn(command, args, {
      cwd,
      env: { ...process.env, ...environment },
      stdio: "pipe",
    });
    let output = "";
    const capture = (data: Buffer) => {
      output = `${output}${data.toString()}`.slice(-50_000);
    };
    processHandle.stdout.on("data", capture);
    processHandle.stderr.on("data", capture);
    processHandle.on("error", (error) => {
      reject(new Error(`Could not start ${command}: ${error.message}`));
    });
    processHandle.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(
        new Error(
          `Command ${command} failed with exit code ${code ?? "unknown"}. Output: ${output}`,
        ),
      );
    });
  });
}

async function findWorkspaceRoot(): Promise<string> {
  const candidates = [process.cwd(), resolve(process.cwd(), "../..")];
  for (const candidate of candidates) {
    try {
      await access(join(candidate, "packages", "cli", "Cargo.toml"));
      return candidate;
    } catch {
      // Continue searching known Next.js working-directory layouts.
    }
  }
  throw new Error(
    "Multivrs build CLI was not found. Set MULTIVRS_CLI_PATH to the runner binary.",
  );
}
