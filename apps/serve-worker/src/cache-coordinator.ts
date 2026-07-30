import { DurableObject } from "cloudflare:workers";
import type { Env } from "./types";

interface LockRow {
  [key: string]: ArrayBuffer | number | string | null;
  expires_at: number;
  owner: string;
}

export class CacheCoordinator extends DurableObject<Env> {
  constructor(context: DurableObjectState, env: Env) {
    super(context, env);
    context.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS cache_lock (id INTEGER PRIMARY KEY CHECK (id = 1), owner TEXT NOT NULL, expires_at INTEGER NOT NULL)",
      );
    });
  }

  tryAcquire(owner: string, ttlMs: number): boolean {
    const now = Date.now();
    const row = this.ctx.storage.sql
      .exec<LockRow>("SELECT owner, expires_at FROM cache_lock WHERE id = 1")
      .toArray()[0];
    if (row && row.expires_at > now && row.owner !== owner) return false;
    this.ctx.storage.sql.exec(
      "INSERT INTO cache_lock (id, owner, expires_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET owner = excluded.owner, expires_at = excluded.expires_at",
      owner,
      now + Math.max(1_000, Math.min(ttlMs, 120_000)),
    );
    return true;
  }

  release(owner: string): boolean {
    const row = this.ctx.storage.sql
      .exec<LockRow>("SELECT owner, expires_at FROM cache_lock WHERE id = 1")
      .toArray()[0];
    if (!row || row.owner !== owner) return false;
    this.ctx.storage.sql.exec("DELETE FROM cache_lock WHERE id = 1");
    return true;
  }
}
