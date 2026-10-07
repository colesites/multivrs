import { useEffect, useState } from "react";
import { dashboardFetch } from "../api";
import { useDashboard } from "../context";
import type { List } from "../types";

export interface IdOption {
  id: string;
  label: string;
  hint: string;
}

/** The official IDs accepted for `country`, and the one chosen (kept if still valid). */
export function useIdTypes(country: string, initial: string) {
  const { apiUrl, scope } = useDashboard();
  const [idTypes, setIdTypes] = useState<IdOption[]>([]);
  const [idType, setIdType] = useState(initial);
  useEffect(() => {
    if (!country) return setIdTypes([]);
    dashboardFetch<List<IdOption>>(
      apiUrl,
      `/setup/id-types?country=${country}`,
      scope,
    )
      .then(({ data }) => {
        setIdTypes(data);
        setIdType((current) =>
          data.some((t) => t.id === current) ? current : (data[0]?.id ?? ""),
        );
      })
      .catch(() => setIdTypes([]));
  }, [apiUrl, country, scope]);
  return { idTypes, idType, setIdType };
}
