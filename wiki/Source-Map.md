# Source map

Application code (excluding generated UI primitives under `src/components/ui/` and `src/routeTree.gen.ts`).

## Entry and runtime

| File | Role |
| --- | --- |
| `src/router.tsx` | Builds the TanStack router with a per-router `QueryClient` in context |
| `src/start.ts` | Start instance: `attachSupabaseAuth` on server functions; error + CSRF on requests |
| `src/server.ts` | Default `fetch` handler; converts catastrophic SSR JSON errors into HTML |
| `vite.config.ts` | Lovable TanStack Vite preset; points server entry at `src/server.ts` |
| `src/styles.css` | Global Tailwind / theme tokens (`canvas`, `ink`, `fog`, `saffron`, …) |

## Routes

| File | URL | Notes |
| --- | --- | --- |
| `src/routes/__root.tsx` | (all) | HTML shell, QueryClientProvider, toaster, 404/error, auth invalidation |
| `src/routes/index.tsx` | `/` | Marketing landing; redirects signed-in users to `/home` |
| `src/routes/auth.tsx` | `/auth` | Email/password + Google; campus domain gate |
| `src/routes/_authenticated/route.tsx` | layout | Session + campus email; `AppShell` |
| `src/routes/_authenticated/home.tsx` | `/home` | Dashboard: stats, featured event, announcements, upcoming, activity |
| `src/routes/_authenticated/events.index.tsx` | `/events` | Event list |
| `src/routes/_authenticated/events.$id.tsx` | `/events/:id` | Detail + register / leave |
| `src/routes/_authenticated/announcements.tsx` | `/announcements` | Full notice list |
| `src/routes/_authenticated/activities.tsx` | `/activities` | Archive with category filter |
| `src/routes/_authenticated/community.tsx` | `/community` | Posts, likes, comments, report, delete own |
| `src/routes/_authenticated/assistant.tsx` | `/assistant` | Chat UI; injects live events/announcements as context |
| `src/routes/_authenticated/notifications.tsx` | `/notifications` | Mark one / all read |
| `src/routes/_authenticated/profile.tsx` | `/profile` | Edit profile, joined events, sign out |
| `src/routes/_authenticated/admin.tsx` | `/admin` | Admin tabs: dashboard, events, announcements, moderation, team, profile |
| `src/routes/README.md` | — | File-routing conventions for contributors |

## Libraries and hooks

| File | Role |
| --- | --- |
| `src/lib/queries.ts` | All React Query option objects and row types used by the app |
| `src/lib/campus.ts` | Allowed email domains and error copy |
| `src/lib/ai.functions.ts` | `askAssistant` server function (Lovable AI gateway) |
| `src/lib/format.ts` | Dates, countdown labels, initials |
| `src/lib/event-images.ts` | Category → default cover image and chip accent |
| `src/lib/utils.ts` | `cn()` class merge |
| `src/lib/error-page.ts` | HTML 500 page markup |
| `src/lib/error-capture.ts` | Captures last error for SSR normalization |
| `src/lib/lovable-error-reporting.ts` | Reports root-boundary errors to Lovable |
| `src/hooks/useSession.ts` | `useUser` (auth) and `useMe` (profile + roles + `isAdmin`) |
| `src/hooks/use-mobile.tsx` | Viewport helper for UI primitives |

## Integrations

| File | Role |
| --- | --- |
| `src/integrations/supabase/client.ts` | Browser/SSR Supabase client (publishable key, preview storage) |
| `src/integrations/supabase/client.server.ts` | Server-side client helper |
| `src/integrations/supabase/types.ts` | Generated Postgres types |
| `src/integrations/supabase/auth-attacher.ts` | Attaches bearer token to server-fn requests |
| `src/integrations/supabase/auth-middleware.ts` | Optional `requireSupabaseAuth` for server fns that must validate JWT |
| `src/integrations/supabase/cron-auth.ts` | Cron / service-style auth helper |
| `src/integrations/supabase/previewAuthStorage.ts` | Auth storage for Lovable preview |
| `src/integrations/lovable/index.ts` | Google OAuth via Lovable, then `supabase.auth.setSession` |

## UI

| File | Role |
| --- | --- |
| `src/components/AppShell.tsx` | Desktop sidebar, mobile header + bottom nav, unread badge, admin link |
| `src/components/ui/*` | shadcn/Radix primitives (not product-specific) |

## Database

| File | Role |
| --- | --- |
| `supabase/config.toml` | Linked project `pogwasqqwuykcxsvzwsv` |
| `supabase/migrations/20260908065509_*.sql` | Core schema, RLS, signup trigger, seed events/announcements/activities |
| `supabase/migrations/20260908065539_*.sql` | Tighten EXECUTE grants on helper functions |
| `supabase/migrations/20260908073107_*.sql` | `admin_stats()` RPC |
| `supabase/migrations/20260908074048_*.sql` | Report resolution columns |
| `supabase/migrations/20260908074115_*.sql` | Further REVOKE/GRANT on RPCs |
| `supabase/migrations/20260909090538_*.sql` | Super-admin role policies + seed `admin@searchingeyes.test` |

## What is generated / do not edit by hand

- `src/routeTree.gen.ts` — TanStack Router plugin
- `src/integrations/supabase/client.ts`, `auth-attacher.ts`, `auth-middleware.ts` — Lovable/Supabase scaffolding comments mark them generated
- `src/integrations/lovable/index.ts` — Lovable-generated OAuth wrapper
