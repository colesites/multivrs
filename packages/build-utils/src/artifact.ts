/**
 * Content-addressed artifact packaging — the "artifact" stage of the deploy
 * loop. Walk a build output directory, hash every file (sha256), and derive a
 * deterministic `artifactHash` over the sorted manifest. Identical output →
 * identical hash, so unchanged deploys dedupe and rollback is exact.
 *
 * The CPU-bound asset optimizer (Rust `builder-core`, ARCHITECTURE.md §5) plugs
 * in before this step later; this is the hashing/manifest half it feeds.
 */
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { join, relative, sep } from "node:path";
import type { BuildOutput } from "./output";

export interface ArtifactFile {
  /** POSIX path relative to the artifact root. */
  path: string;
  /** sha256 of the file contents (hex). */
  hash: string;
  size: number;
}

export interface Artifact {
  /** Content id: sha256 over the sorted `path:hash` manifest. */
  hash: string;
  files: ArtifactFile[];
  /** Builder metadata consumed by the static/function request router. */
  output?: BuildOutput;
}

async function walk(dir: string, out: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
}

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

export async function createArtifact(dir: string): Promise<Artifact> {
  const filePaths: string[] = [];
  await walk(dir, filePaths);

  const files: ArtifactFile[] = [];
  for (const full of filePaths) {
    const contents = await fs.readFile(full);
    const hash = createHash("sha256").update(contents).digest("hex");
    files.push({
      path: toPosix(relative(dir, full)),
      hash,
      size: contents.byteLength,
    });
  }
  files.sort((a, b) => a.path.localeCompare(b.path));

  const manifest = createHash("sha256");
  for (const file of files) {
    manifest.update(`${file.path}:${file.hash}\n`);
  }

  return { hash: manifest.digest("hex"), files };
}
