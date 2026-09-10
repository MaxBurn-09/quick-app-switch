# Development

## Prerequisites

- Node.js (npm) **or** Bun (lockfile is Bun)
- Clone this repo; env vars for Supabase (and AI if you use the assistant)

Typical local commands from the root README:

```sh
npm i
npm run dev
```

Scripts in `package.json`: `dev` (Vite), `build`, `build:dev`, `preview`, `lint`, `format`.

## Environment

| Variable | Used for |
| --- | --- |
| `VITE_SUPABASE_URL` / `SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` | Client + SSR publishable key |
| `LOVABLE_API_KEY` | Campus assistant (server) |

Missing Supabase vars throw at client creation with a message to connect Supabase in Lovable Cloud.

Do not commit secrets. `.env` in a workspace may exist for local preview; keep publishable keys distinct from service role keys. **Service role must never ship to the browser.**

## Conventions

- File routes only under `src/routes` — see `src/routes/README.md`
- Do not hand-edit `src/routeTree.gen.ts`
- Do not re-add Vite plugins already provided by `@lovable.dev/vite-tanstack-config`
- Shared fetches belong in `src/lib/queries.ts` so keys stay consistent
- Dates/labels: `src/lib/format.ts`; event imagery: `src/lib/event-images.ts`

## Lovable sync

This project is connected to [Lovable](https://lovable.dev). Pushes to the connected GitHub branch appear in the Lovable editor. Avoid force-pushing or rewriting published history (`AGENTS.md`).

Live: https://quick-app-switch.lovable.app

## Wiki maintenance

Documentation lives in `/wiki` so it versions with the code. The same pages are published on the GitHub Wiki: https://github.com/MaxBurn-09/quick-app-switch/wiki

When you change schema, routes, or auth rules, update both copies (or copy `wiki/*.md` to the `*.wiki.git` remote). Also update:

- [Database](Database.md) for migrations / RLS
- [Routes](Routes.md) and [Source map](Source-Map.md) for files
- [User flows](User-Flows.md) / [Data flows](Data-Flows.md) for behavior
