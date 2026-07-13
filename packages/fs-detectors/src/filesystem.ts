/**
 * Filesystem abstraction for detection. Detectors run against this interface so
 * the same logic works over the local disk (build time) or any virtual source
 * (e.g. a git tarball, a remote tree) later — mirrors vercel's DetectorFilesystem.
 */
import { promises as fs } from "node:fs";
import { join } from "node:path";

export interface DetectorFilesystem {
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
}

export class LocalFilesystem implements DetectorFilesystem {
  private readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(join(this.root, path));
      return true;
    } catch {
      return false;
    }
  }

  readFile(path: string): Promise<string> {
    return fs.readFile(join(this.root, path), "utf8");
  }
}
