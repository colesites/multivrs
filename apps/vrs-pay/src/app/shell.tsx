import type { ReactNode } from "react";

/**
 * The app owns the outer document here; swift-rust injects metadata, icons,
 * the compiled globals.css and its runtime scripts before </head>.
 *
 * Fonts are requested with explicit axes in one stylesheet. The built-in
 * `swift-rust/font/google` factories only request each family's default
 * instance, which would drop Instrument Serif's true italic and Geist's
 * weight range.
 */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap";

// In-page anchors: close the mobile menu, then scroll ourselves. A native
// fragment navigation fires `popstate`, which swift-rust's client router
// answers by re-rendering the page and resetting scroll; replaceState doesn't.
// Guarded because the router re-runs body scripts after client navigations.
const IN_PAGE_LINKS = `window.__vrsInPage||(window.__vrsInPage=1,document.addEventListener("click",function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var m=document.getElementById("mobile-nav");if(m&&m.hidePopover&&m.matches(":popover-open"))m.hidePopover();var id=a.getAttribute("href").slice(1),t=id&&document.getElementById(id);if(!t)return;e.preventDefault();t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});history.replaceState(history.state,"","#"+id)}));`;

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body className="min-h-dvh bg-white font-sans text-ink antialiased">
        {children}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: IN_PAGE_LINKS }} />
      </body>
    </html>
  );
}
