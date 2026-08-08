# Fix Supabase email links (localhost → production)

Confirmation emails use **two** settings: your app code **and** the Supabase dashboard.

## 1. Vercel environment variable

Add to **Production** (and Preview if you use preview deploys):

```env
VITE_APP_URL=https://seldom-nine.vercel.app
```

Redeploy after saving.

Seldom sends `emailRedirectTo: https://seldom-nine.vercel.app/auth/callback` on sign-up.

## 2. Supabase dashboard (required)

Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**:

| Field | Value |
|-------|--------|
| **Site URL** | `https://seldom-nine.vercel.app` |
| **Redirect URLs** | Add all of these (one per line): |

```
https://seldom-nine.vercel.app/**
https://seldom-nine.vercel.app/auth/callback
https://seldom-nine.vercel.app/reset-password
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

Save. **Site URL** is the default when templates don’t use `emailRedirectTo` — if it’s still `http://localhost:3000`, emails will keep pointing there.

## 3. Optional — customize email template

Authentication → **Email Templates** → **Confirm signup**

Ensure the link uses `{{ .ConfirmationURL }}` (default). Don’t hardcode localhost.

## 4. Test

1. Sign up on **production** (not localhost).
2. Open the email link — it should land on `https://seldom-nine.vercel.app/auth/callback` then redirect home.

## Local dev

Keep in `.env.local`:

```env
VITE_APP_URL=http://localhost:3000
```

Sign-up on localhost will use localhost redirect URLs (allowed in Redirect URLs above).
