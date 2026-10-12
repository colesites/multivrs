/** A short label for a browser or device, such as "Chrome on macOS". */
export function describeDevice(userAgent: string | null) {
  if (!userAgent) return { label: "Unknown device", mobile: false };
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : (userAgent.split(/[\s/]/)[0] ?? "Unknown client");
  const system = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  return {
    label: system ? `${browser} on ${system}` : browser,
    mobile: system === "iOS" || system === "Android",
  };
}
