"use client";

import { useEffect, useState } from "react";
import { watchMediaQuery } from "@/lib/browser/media-query";

const DESKTOP_QUERY = "(min-width: 768px)";

export function useResponsiveSheetSide(): "bottom" | "right" {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(query.matches);
    update();
    return watchMediaQuery(query, update);
  }, []);

  return desktop ? "right" : "bottom";
}
