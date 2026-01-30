# World Sports Academy

High‑performance sports website built with Next.js 15, TypeScript, Tailwind v4, and Supabase.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, DB, Storage)
- shadcn/ui
- Vitest (tests)

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables
Create `.env.local` in the **project root** with:
```bash
# App URL — for local dev use localhost so login stays on localhost (see docs/LOCAL_DEVELOPMENT.md)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Drop-in page: set false (or omit) for local so you can view without login; set true in production (e.g. Vercel)
# REQUIRE_AUTH_FOR_DROP_IN_VIEW=false

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-ref-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Optional: server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=development

# Cal.com API v2 Configuration
# Option 1: API Key authentication (for regular API usage)
# Get from: Cal.com Settings > Security
# Test mode keys: cal_*, Live mode keys: cal_live_*
CALCOM_API_KEY=your-cal-com-api-key

# Option 2: OAuth Client Credentials (for platform customers)
# Get from: Cal.com Platform Dashboard > OAuth Clients
# Required for: Managed users, team management, OAuth client webhooks
# CALCOM_OAUTH_CLIENT_ID=your-oauth-client-id
# CALCOM_OAUTH_CLIENT_SECRET=your-oauth-client-secret

# Cal.com API base URL (defaults to v2)
# CALCOM_API_URL=https://api.cal.com/v2

# Webhook secret for verifying webhook signatures
# CALCOM_WEBHOOK_SECRET=your-webhook-secret

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Payment notifications
RESEND_API_KEY=
RESEND_SENDER_EMAIL="World Sports Academy <payments@yourdomain.com>"
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=+15551234567

# Alerting (optional)
PAYMENT_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**Note:** You need either `CALCOM_API_KEY` OR both `CALCOM_OAUTH_CLIENT_ID` and `CALCOM_OAUTH_CLIENT_SECRET`. OAuth is for platform customers managing managed users.

### 3) Development
```bash
npm run dev
```
- App runs at http://localhost:3000

**Google auth on localhost:** If login redirects you to production instead of staying on localhost, add `http://localhost:3000/auth/callback` to **Supabase** → Authentication → URL Configuration → Redirect URLs, and set `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local`. Full steps: [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

### 4) Tests
```bash
npm run test
```

## Project Structure
```
myapp/
  app/                  # Next.js app router
    (auth)/             # Auth routes
    (dashboard)/        # Example dashboard routes
    layout.tsx          # Root layout (Poppins font, globals)
    page.tsx            # Home page composition
    globals.css         # Tailwind v4 tokens & base styles
  components/
    hero.tsx
    navbar.tsx
    sports-section.tsx
    facilities-section.tsx
    locations-section.tsx
    footer.tsx
    ui/                 # shadcn/ui components
  lib/
    env.ts              # zod env validation
    supabase/           # server/client helpers
  server/
    actions/            # server actions examples
    queries/            # supabase query examples
  supabase/             # CLI config & migrations
  types/                # generated supabase types
```

## Branding
- Company: World Sports Academy
- Non kids‑centric copy & CTAs (e.g., "Enroll now", "Explore programs").

## Deployment
Any platform that supports Next.js 15 (Vercel recommended):
1. Set environment variables in the hosting platform.
2. Build: `npm run build`
3. Start: `npm start`

## Stripe Drop-in Flow
- Users with memberships are auto-confirmed without payment.
- Drop-in bookings now use Stripe Payment Intents + Elements (3D Secure ready).
- Webhooks finalize bookings and log payment/refund events for reconciliation.
- Refunds trigger Stripe API, email, and SMS notifications automatically.

## Scripts
```jsonc
{
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "db:start": "supabase start",
  "db:stop": "supabase stop",
  "db:reset": "supabase db reset",
  "db:types": "supabase gen types --local > types/supabase.ts",
  "db:push": "supabase db push"
}
```

## Contributing
- Conventional commits recommended
- PRs welcome

## License
MIT
