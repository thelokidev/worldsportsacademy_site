# Local development setup

This guide gets Google (and other) auth working on **localhost** so you can test changes without being redirected to production.

## Why login redirects to production

Supabase Auth only redirects users to URLs that are in the project’s **Redirect URLs** list. If `http://localhost:3000/auth/callback` is not listed, Supabase sends users to the default (often your production URL) after Google sign-in. Fixing that list and your local env keeps you on localhost.

---

## 1. Environment variables

Create or edit `.env.local` in the **project root**. For local dev you **must** set:

```bash
# Base URL of your app — use localhost for local dev (required for auth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Drop-in page: don't require login to view (only to book). Omit or set false for local.
REQUIRE_AUTH_FOR_DROP_IN_VIEW=false

# Supabase (from Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (test keys for dev)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Important:** For local development, **do not** set `NEXT_PUBLIC_APP_URL` to your production URL. The app uses this for redirects (e.g. magic links and OAuth callback). If it points to prod, you can end up on prod after login.

---

## 2. Supabase: allow localhost redirects

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://127.0.0.1:3000/auth/callback` (optional; use if you open the app via 127.0.0.1)
4. **Site URL** can stay as your production URL; Redirect URLs control where auth is allowed to send users after login.
5. Save.

After this, Supabase will accept redirects to localhost and you’ll land back on your dev app after Google sign-in.

---

## 3. Google Cloud (OAuth client)

You use **one** Supabase project for both local and production. The redirect URI Google talks to is Supabase’s (e.g. `https://your-project.supabase.co/auth/v1/callback`), not your app’s. So you usually **do not** add localhost to the Google OAuth client.

Only if you use a **separate** Supabase project for dev:

- Create a second OAuth 2.0 Client (or add an extra redirect URI) in [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
- Add that **Supabase** auth callback URL (e.g. `https://your-dev-project.supabase.co/auth/v1/callback`) to **Authorized redirect URIs**.

For a single Supabase project, no Google change is needed once Supabase Redirect URLs include localhost.

---

## 4. Run the app

```bash
npm install
npm run dev
```

- Open **http://localhost:3000** (or http://127.0.0.1:3000 if you added that redirect URL).
- Go to the login page and choose **Continue with Google**.
- You should return to **http://localhost:3000** (e.g. `/dashboard`) and stay in your local environment.

---

## 5. Drop-in page toggle (local vs prod)

- **Local:** Set `REQUIRE_AUTH_FOR_DROP_IN_VIEW=false` in `.env.local` (or omit it). You can open `/drop-in` without logging in; auth is only required when you try to book.
- **Production:** In Vercel (or your host), set `REQUIRE_AUTH_FOR_DROP_IN_VIEW=true`. Then visiting `/drop-in` without being logged in redirects to the auth page, like before.

## 6. Checklist

| Step | Check |
|------|--------|
| Env | `.env.local` has `NEXT_PUBLIC_APP_URL=http://localhost:3000` |
| Drop-in (local) | `REQUIRE_AUTH_FOR_DROP_IN_VIEW=false` or unset so you can view drop-in without login |
| Drop-in (prod) | `REQUIRE_AUTH_FOR_DROP_IN_VIEW=true` in Vercel so prod requires login to view drop-in |
| Supabase | **Authentication** → **URL Configuration** → **Redirect URLs** includes `http://localhost:3000/auth/callback` |
| App | You open the app at `http://localhost:3000` (not prod) before clicking login |

---

## Separate dev Supabase project (optional)

If you want a dedicated **dev** Supabase project (separate DB and auth from production):

1. Create a new project in the Supabase dashboard.
2. In that project, set **Redirect URLs** to `http://localhost:3000/auth/callback` (and optionally 127.0.0.1).
3. In Google Cloud, add the **dev** Supabase auth callback URL to your OAuth client’s **Authorized redirect URIs**.
4. Use the **dev** project’s URL and keys in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

Then local dev uses the dev project; production keeps using the prod project and prod env vars.
