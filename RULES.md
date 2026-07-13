# Project Rules & Guidelines

## 1. Core Stack & Tooling
- **Framework:** Next.js 16+ (App Router strictly).
- **Package Manager:** `bun` **ONLY**. Do not use `npm`, `pnpm`, or `yarn`.
- **Database/Backend:** Convex (real-time/mutations) and Neon (serverless Postgres).
- **Styling:** Tailwind CSS.

## 2. File Structure & Sizing limits
- **Single Responsibility:** Each file must have one clearly defined purpose.
- **Strict Size Limits:** Avoid files longer than 150 lines.
- **Aggressive Splitting:** If a file approaches 100–150 lines, it must be split into smaller modules (e.g., extract complex types, sub-components, or utility functions).
- **Absolute Imports:** Always use absolute paths.
  - ❌ `import Button from "../../../../components/ui/Button"`
  - ✅ `import Button from "@/components/ui/button"`

## 3. Strict TypeScript & Validation
- **No `any`:** ❌ Never use `any`. Use `unknown` if a shape is truly unpredictable and type-guard it.
- **No Force Casting:** ❌ Avoid `as unknown as <Type>`.
- **Explicit Types:** ✅ Always define `interface` or `type` for props, state, and API responses.
- **Zod Validation:** Always validate incoming API data, form submissions, and database schemas using `zod`.

## 4. Naming Conventions
- **Components:** PascalCase (e.g., `UserCard.tsx`, `SignInForm.tsx`).
- **Hooks:** camelCase, must start with `use` (e.g., `useAuth.ts`).
- **Types:** lowercase with `.types.ts` suffix (e.g., `user.types.ts`).
- **Services:** lowercase with `.service.ts` suffix (e.g., `auth.service.ts`).
- **Constants:** UPPER_SNAKE_CASE (e.g., `USER_ROLES`). No magic strings or numbers.

## 5. Next.js Architecture: RSC & Client Boundaries
- **Server by Default:** Use React Server Components (RSC) unless client interactivity is strictly required.
- **Client Boundary:** Use `"use client"` *only* when you need:
  - `useState`, `useEffect`, or custom React hooks.
  - Browser APIs (e.g., `window`, `localStorage`).
  - Event handlers (`onClick`, `onChange`).
- **Push Boundaries Down:** Keep `"use client"` as far down the component tree as possible to minimize client bundle sizes.

## 6. Data Fetching & Logic Separation
- **Never Mix UI and Complex Logic:** UI components should focus on rendering. 
- **Convex (Client/Real-time):** Use Convex hooks (`useQuery`, `useMutation`) inside client components or custom hooks (e.g., `hooks/useUsers.ts`).
- **Neon (Server/Relational):** Do not write raw SQL inside UI components. Route Neon database queries through Server Actions or dedicated service files.
  - ❌ *Bad (Logic in UI):* `const data = await sql\`SELECT * FROM users\`` directly in `app/page.tsx`
  - ✅ *Good (Service Pattern):* `const users = await userService.getUsers()` inside a Server Component, where `getUsers` lives in `services/user.service.ts`.

## 7. UI, Styling & Aesthetics
- **Reusable First:** Always check `components/ui/` to see if a component exists before creating a new one. Do not build redundant buttons or modals.
- **No Inline Styles:** Use Tailwind CSS exclusively. ❌ `<div style={{ margin: 20 }}>`
- **Premium Aesthetics:** Prioritize high-end, native-feeling UI treatments:
  - Apply **glassmorphism** and liquid glass effects via `backdrop-blur` and gradients.
  - Use **3D dimensionality** (subtle layered shadows, inset shadows).
  - Implement **neubrutalism** for high-contrast, impactful elements where appropriate.
- **Performance:** Ensure 60fps animations and zero layout shift. The web app must feel indistinguishable from native desktop/mobile software.

## 8. Error Handling & Loading States
- **Async Safety:** Every async function must have error handling (e.g., `try/catch`).
- **UI States:** Every async UI interaction must explicitly handle `loading`, `error`, and `success` states.
- **Next.js Boundaries:** Utilize `loading.tsx`, `error.tsx`, and `<Suspense>` boundaries for server-side state management.

## 9. Purity & Production Readiness
- **Pure Components:** Avoid side effects inside the render body. Use `useEffect` or server-side data fetching.
- **No Console Logs:** Remove all `console.log()` statements before committing. Use proper logging services for production.
- **Environment Variables:** Never hardcode secrets. Use `process.env` securely (and `NEXT_PUBLIC_` only for explicitly public keys).

## 10. Testing
- **Always do testing.** Ensure critical paths, utility functions, and complex UI states have unit and integration tests.