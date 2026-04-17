# Multivrs Site Architecture (Next.js App Router)

## 1) Product Organization
- `Products`: Multivrs Space, Kontinue AI, Present, EchoLive
- `Developer Tools`: Nexus, Planet UI
- `Resources`: Blog, Docs, Guides, Changelog, Case Studies
- `Open Source`: Nexus core, Planet UI packages, examples
- `Company`: About, Careers, Contact, Security, Legal

Why:
- `Nexus` belongs in `Developer Tools` first, mirrored in `Open Source`.
- `Planet UI` belongs in `Developer Tools` as primary, with OSS distribution.

## 2) Route System
```txt
src/app/
  (marketing)/
    layout.tsx
    page.tsx                       # Home
    products/page.tsx
    pricing/page.tsx
    resources/page.tsx
    about/page.tsx
    contact/page.tsx
    careers/page.tsx
  (content)/
    blog/page.tsx
    blog/[slug]/page.tsx
    changelog/page.tsx
  (docs)/
    docs/page.tsx
    docs/[...slug]/page.tsx
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
    verify-email/page.tsx
  (dashboard)/
    dashboard/layout.tsx
    dashboard/page.tsx             # Overview
    dashboard/projects/page.tsx
    dashboard/deployments/page.tsx
    dashboard/domains/page.tsx
    dashboard/env/page.tsx
    dashboard/billing/page.tsx
    dashboard/usage/page.tsx
    dashboard/team/page.tsx
    dashboard/settings/page.tsx
    dashboard/logs/page.tsx
  api/
    auth/[...all]/route.ts
```

## 3) Home Page Section Order
1. Hero: clear value, core CTA, trust posture.
2. Social proof: logos + quick credibility stats.
3. Ecosystem spotlight: Space, Nexus, Planet UI, Kontinue AI.
4. Why Multivrs: speed, DX, reliability, design quality.
5. Feature grid: deploy, observability, team workflows, security.
6. Performance metrics: global edge + latency/value indicators.
7. Testimonials / case snapshots.
8. Pricing preview: Free vs Pro vs Business.
9. FAQ.
10. Final CTA + compact footer nav.

## 4) Navigation
- Top nav: Products, Developer Tools, Resources, Pricing, Company.
- Primary CTA: `Start Free`.
- Secondary CTA: `Book Demo` (desktop), hidden in mobile drawer.
- Footer columns: Products, Developers, Resources, Company, Legal.

## 5) Metadata + SEO System
- Global metadata in root `layout.tsx` using `title.template`.
- Route-level metadata for product and docs pages.
- File conventions:
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`
  - `src/app/opengraph-image.tsx`
- URL strategy:
  - `/products/{product}`
  - `/docs/{product}/{topic}`
  - `/blog/{slug}`
- Internal linking:
  - Every product page links to docs, pricing, and one case study.
  - Blog posts link to related docs + product CTA block.

## 6) Conversion SEO
- Entry pages:
  - Deployment intent: Space pages + docs + migration guides.
  - AI intent: Kontinue AI use-cases + developer integrations.
  - Presentation intent: Present vs alternatives comparison pages.
- BOFU conversion blocks:
  - sticky CTA on docs pages
  - in-article demo CTAs for blog tutorials
  - pricing CTA from every product page

## 7) Content Program
- Pillars:
  - Next.js deployment and performance
  - AI product engineering
  - Developer education (DX, architecture, scaling)
  - presentation/live production workflows
- Cadence:
  - 2 technical tutorials per week
  - 1 comparison/positioning piece per month
  - monthly changelog digest

## 8) Implementation Notes
- Use Server Components by default; push client boundaries down.
- Keep page-level logic in route files; extract rendering blocks into `src/components/sections/*`.
- Keep file size under 150 lines with split data files and typed models.
