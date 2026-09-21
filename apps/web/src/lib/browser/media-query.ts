/**
 * Subscribes to a media query across browser versions.
 *
 * Safari 13 and older only implement the deprecated `addListener` API, so
 * feature-detect before using the modern event listener. Returns an
 * unsubscribe function.
 */
export function watchMediaQuery(
  media: MediaQueryList,
  onChange: (event: MediaQueryListEvent) => void,
): () => void {
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }

  media.addListener(onChange);
  return () => media.removeListener(onChange);
}
