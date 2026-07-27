"use client";

import { usePathname } from "next/navigation";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";

export interface DashboardScope {
  /** Account slug (first path segment). */
  username: string;
  /** `~` for all-projects, or the active project slug. */
  scope: string;
  /** Active section slug (`cdn`, `logs`, …) or `""` at the scope root. */
  activeSlug: string;
  /** True when viewing the all-projects (`~`) scope. */
  isAllProjects: boolean;
}

/**
 * Derive the dashboard scope from the URL.
 *
 *   /c-tech                     → { c-tech, ~,            ""  }
 *   /c-tech/~/cdn               → { c-tech, ~,            cdn }
 *   /c-tech/kontinue-ai         → { c-tech, kontinue-ai,  ""  }
 *   /c-tech/kontinue-ai/cdn     → { c-tech, kontinue-ai,  cdn }
 */
export function useDashboardScope(): DashboardScope {
  const pathname = usePathname();

  const [username = "", rawScope, rawSlug] = pathname
    .split("/")
    .filter(Boolean);
  const scope = rawScope ?? ALL_PROJECTS_SCOPE;
  return {
    username,
    scope,
    activeSlug: rawSlug ?? "",
    isAllProjects: scope === ALL_PROJECTS_SCOPE,
  };
}
