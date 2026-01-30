# World Sports Academy

Next.js 16 App Router app for a sports academy: bookings, memberships, courts, camps, and training. Uses Supabase (auth + DB) and Stripe (payments, subscriptions).

## Project structure

- `app/` – Next.js App Router: `(admin)/`, `(auth)/`, `(dashboard)/`, `api/`, and public routes (`bookings`, `camps`, `memberships`, etc.)
- `components/` – `ui/` (shadcn-style), `features/`, `programs/`, `training/`
- `lib/` – Supabase clients, Stripe, auth, payments, notifications, utils
- `server/` – Server actions and queries (`actions/`, `queries/`)
- `supabase/` – Migrations and config
- `types/` – `supabase.ts` (generated types)
- `hooks/` – React hooks (admin dashboard, PWA, toast)

## Tech stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge
- **Backend:** Supabase (auth, Postgres, Realtime), Stripe (checkout, webhooks, subscriptions)
- **UI:** Radix primitives, Lucide icons, Sonner toasts, react-hook-form + Zod

## Code standards

- Use TypeScript with strict types; prefer existing `types/supabase.ts` for DB types.
- Use Tailwind for styling; use `class:` (or equivalent) for conditional classes; avoid inline CSS.
- Use descriptive names; event handlers with `handle` prefix (e.g. `handleClick`, `handleSubmit`).
- Prefer `const fn = () =>` over `function fn()`; use early returns for clarity.
- Accessibility: use semantic HTML, `aria-*`, `tabIndex` where needed.
- Server: use `server/actions/` and `server/queries/`; keep API routes in `app/api/`.
- Env: use `lib/env.ts` for validated env vars; never commit secrets.

## Conventions

- Bookings: logic in `server/actions/bookings.ts`, `lib/booking-authorization.ts`; capacity rules in `docs/BOOKING_CAPACITY_RULES.md`.
- Memberships: Stripe product/price IDs in `lib/stripe/membership-plans.ts`; sync with Supabase and Stripe catalog as needed.
- Admin: routes under `app/(admin)/admin/`; auth in `lib/auth/admin.ts`.
- Migrations: add SQL in `supabase/migrations/`; run with `npm run db:push` or Supabase CLI.
