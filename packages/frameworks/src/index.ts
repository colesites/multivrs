import type { FrameworkId } from "@multivrs/config";
import { FRAMEWORKS } from "./catalog";
import type { Framework } from "./types";

export * from "./catalog";
export * from "./types";

/** Look up a framework preset by id. */
export function getFramework(id: FrameworkId): Framework | undefined {
  return FRAMEWORKS.find((f) => f.id === id);
}
