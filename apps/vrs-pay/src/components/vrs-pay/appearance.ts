import type { CSSProperties } from "react";

export interface VrsAppearance {
  /** Force light, dark, or follow system theme ("auto"). */
  theme?: "light" | "dark" | "auto";
  /** Primary accent color (defaults to VRS Pay violet #6936f5). */
  accent?: string;
  /** Hover accent color. */
  accentHover?: string;
  /** Accent contrast text color (defaults to white). */
  accentText?: string;
  /** Border radius in px (number) or CSS string (e.g. 20 or "1.25rem"). */
  radius?: number | string;
  /** Primary typography font family. */
  font?: string;
  /** Alias for font. */
  fontFamily?: string;
  /** Custom CSS variables override map, e.g. { "--vrs-surface": "#000" } */
  variables?: Record<string, string>;
}

/**
 * Converts high-level appearance props into CSS style variables for drop-in components.
 */
export function appearanceToStyle(appearance?: VrsAppearance): CSSProperties | undefined {
  if (!appearance) return undefined;
  const style: Record<string, string> = {};

  if (appearance.accent) {
    style["--vrs-accent"] = appearance.accent;
    style["--vrs-accent-glow"] = `${appearance.accent}26`;
  }
  if (appearance.accentHover) {
    style["--vrs-accent-hover"] = appearance.accentHover;
  }
  if (appearance.accentText) {
    style["--vrs-accent-text"] = appearance.accentText;
  }
  if (appearance.radius !== undefined) {
    const radiusStr =
      typeof appearance.radius === "number" ? `${appearance.radius}px` : appearance.radius;
    style["--vrs-radius"] = radiusStr;
    if (typeof appearance.radius === "number") {
      style["--vrs-radius-sm"] = `${Math.max(4, Math.round(appearance.radius / 2))}px`;
    }
  }
  const font = appearance.font ?? appearance.fontFamily;
  if (font) {
    style["--vrs-font"] = font;
  }
  if (appearance.variables) {
    for (const [key, value] of Object.entries(appearance.variables)) {
      const varKey = key.startsWith("--") ? key : `--${key}`;
      style[varKey] = value;
    }
  }

  return Object.keys(style).length > 0 ? (style as unknown as CSSProperties) : undefined;
}
