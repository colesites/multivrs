"use client";

import { useEffect, useState } from "react";

/**
 * A time in the viewer's own time zone. The server doesn't know it, so the
 * text appears after hydration.
 */
export function LocalTime({ value }: { value: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(
      new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    );
  }, [value]);
  return <time dateTime={value}>{text}</time>;
}
