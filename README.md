# SvelteKit SaaS Starter (Svelte 5 + Remote Functions)

Modern SvelteKit 2 starter kit for building SaaS apps with:

- Svelte 5 (runes) and SvelteKit 2
- Remote Functions for secure server calls from the client
- OAuth via Arctic (arcticjs.dev)
- Drizzle ORM + PostgreSQL
- Redis (ioredis) for sessions/cache/queues
- Tailwind CSS v4 + shadcn-svelte components

This repository is designed as a template to bootstrap production-ready SvelteKit apps with batteries included, strong defaults, and a clean architecture.

—

Badges: SvelteKit • Svelte 5 • Tailwind v4 • shadcn-svelte • Drizzle • PostgreSQL • Redis • Arctic OAuth

## Features

- Authentication: OAuth providers powered by Arctic (secure PKCE, state, nonce)
- Authorization-ready: session primitives and guards you can extend
- Data layer: Drizzle ORM with type-safe schema and migrations
- Caching/session: Redis (ioredis)
- Remote Functions: strongly-typed server calls from the client
- UI: Tailwind v4 + shadcn-svelte (preconfigured)
- DX: ESLint, Prettier, type-first code style, sensible scripts
- Deploy anywhere: adapters (Vercel/Netlify), Docker, or any Node host

## Tech Stack

- Framework: SvelteKit 2, Svelte 5 runes ($state, $derived, $effect)
- Styling: Tailwind CSS v4, shadcn-svelte
- Auth: Arctic (GitHub/Google/etc.)
- DB: PostgreSQL with Drizzle ORM & drizzle-kit migrations
- Cache/Session: Redis via ioredis
- Language/Tooling: TypeScript, ESLint, Prettier

## Project Structure

This template follows a conventional SvelteKit layout and keeps server-only logic out of the client bundle.

- `src/routes` — app routes (pages, endpoints)
- `src/lib` — shared code (components, utils, types)
- `src/lib/server` — server-only modules (DB, Redis, auth, remote functions)
- `src/lib/server/remote` — Remote Functions definitions
- `src/lib/server/auth` — Arctic OAuth setup (providers, session utils)
- `src/lib/db` — Drizzle schema and client
- `drizzle/` — migration files
- `static/` — static assets

Note: exact folders may evolve; the separation between client-safe and server-only code is intentional to keep secrets and heavy deps off the client.

## Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+ (local or managed)
- Redis 6+ (local or managed)

## Quick Start

```bash
git clone <this-repo-url> my-app
cd my-app
npm install   # or pnpm i / yarn
cp .env.example .env
# fill in environment variables (see below)

# Database: generate and run migrations
npm run db:generate
npm run db:migrate

# Start dev server
npm run dev
```

Then open http://localhost:5173 (or the port shown in your terminal).

## Local Development (Docker + Makefile)

This template ships with Docker-based local services and a Makefile for convenience.

- Compose file: `docker/docker-compose.dev.yml`
- Services: PostgreSQL (port 5432), Redis (port 6379)

Helpful Make targets:

```bash
make up         # start Postgres & Redis in the background
make down       # stop and remove containers
make restart    # restart containers
make logs       # follow logs for all services
make redis-flush# flush all Redis data (dev only)
make check      # ensure required containers exist and are running
make dev        # ensure services are up, then run the app (uses Bun by default)
```

Suggested local env values when using Docker services:

```bash
DATABASE_URL=postgres://postgres:123@localhost:5432/starter
REDIS_URL=redis://localhost:6379
```

Note: `make dev` uses Bun (DEV_COMMAND in Makefile). You can still run `npm run dev` if you prefer Node/npm; just ensure `make up` has started the services first.

## Environment Variables

Create and fill `.env` with the following (names are UPPERCASE by convention):

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `AUTH_SECRET` — long random string for signing the auth session cookie
- `GOOGLE_CLIENT_ID` — Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth Client Secret
- `GITHUB_CLIENT_ID` — GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` — GitHub OAuth Client Secret
- `PORT` — optional; used to infer origin locally if set (defaults to 5173)
- `ORIGIN` — optional; absolute origin to build callback URIs (overrides PORT)

Keep secrets out of the client. Read them only from server modules (`src/lib/server/**`).

## Database (Drizzle + PostgreSQL)

- Define schema in `src/lib/db/schema.ts`
- Configure Drizzle client in `src/lib/db/client.ts`
- Migrations live in `drizzle/`

Common scripts:

```bash
npm run db:generate   # generate SQL from schema
npm run db:migrate    # apply migrations
npm run db:studio     # optional: open drizzle studio if configured
```

Use transactions for multi-step writes and create indexes for critical queries. See `.windsurf/docs/drizzle.txt` for detailed Drizzle notes.

## Redis (ioredis)

Use Redis for:

- Session persistence (if not using cookies-only)
- Caching expensive queries
- Background job queues

Create a single connection in `src/lib/server/redis.ts` and reuse it across server modules.

## Authentication with Arctic (project-specific)

Arctic provides secure OAuth flows with state, nonce, and PKCE where supported. This starter wraps Arctic in a small auth module with providers and a Redis-backed session manager.

Auth module structure:

- `src/lib/server/auth/index.ts` — AuthInstance wiring (providers, session manager, config)
- `src/lib/server/auth/core/*` — core types and BaseSession utilities
- `src/lib/server/auth/providers/{google,github}.ts` — Arctic provider adapters
- `src/lib/server/auth/sessions/redis-session.ts` — Redis session manager
- `src/lib/remotes/auth/auth.remote.ts` — remote functions: `handleLogin`, `handleLogout`, `handleMockLogin`
- `src/params/auth_provider.ts` — param matcher for provider segments
- `src/hooks.server.ts` — loads `event.locals.user` from Redis session

Session details:

- Cookie name: `auth_session`
- Lifetime: 604800 seconds (7 days)
- Cookie options: `httpOnly`, `sameSite=lax`, `secure` in production
- Storage: Redis, key pattern: `auth_session:<sessionId>`

Routes and flow in this repo:

1. Start login: call remote `auth.handleLogin` with `{ provider, state? }`
   - Builds callback: `${origin}/auth/callback/<provider>`
   - Returns `redirect` URL to the provider
2. OAuth callback: handled at `/auth/callback/<provider>`
   - Implemented using a param matcher at `src/routes/auth/callback/[...rest=auth_provider]/`
   - Provider validates code/state (and PKCE where applicable), returns user claims
   - App upserts user, creates a Redis session, and sets the signed cookie
3. Logout: call remote `auth.handleLogout` to clear Redis state and delete cookie

Adding a provider:

- Add env vars: `<PROVIDER>_CLIENT_ID` and `<PROVIDER>_CLIENT_SECRET`
- Create `src/lib/server/auth/providers/<provider>.ts` implementing the Provider interface
- Export it in `src/lib/server/auth/providers/index.ts`
- Register it in `src/lib/server/auth/index.ts`

See https://arcticjs.dev/ for full API and examples.

## Remote Functions

Remote Functions let you call server code directly from the client with type-safety and without exposing endpoints manually.

Conventions in this template:

- Define functions under `src/lib/server/remote/*`
- Keep them small, single-purpose, and auth-aware
- Only import these from client code through SvelteKit’s remote-call mechanism

Example (conceptual):

```ts
// src/lib/server/remote/user.ts
export async function getProfile() {
	/* server-only, checks session, queries DB */
}

// src/routes/(app)/profile/+page.svelte
// call the remote function; SvelteKit handles transport and types
// const profile = await remote(user.getProfile)()
```

Refer to `.windsurf/docs/sveltekit.txt` for SvelteKit 2 Remote Functions details.

## UI: Tailwind v4 + shadcn-svelte

- Tailwind v4 is preconfigured
- shadcn-svelte provides accessible, themeable components

Usage:

- Add components via shadcn-svelte CLI
- Keep styles in `src/app.css` and component-level styles minimal

## Scripts

Common scripts you’ll find or add:

- `dev` — start dev server
- `build` — build for production
- `preview` — preview built app
- `lint` / `format` — code quality
- `db:generate` / `db:migrate` / `db:studio` — Drizzle workflows
- `docker:up` / `docker:down` — compose up/down (if using Docker)

Check `package.json` for the authoritative list.

## Docker (optional but recommended)

Containerize for parity across environments.

- App image: multi-stage Node build
- Services: Postgres, Redis via `docker-compose.yml`
- Volumes for DB data

See `.windsurf/docs/docker.txt` for a comprehensive Docker reference and examples.

## Security Notes

- Never expose secrets to the client; keep them in server modules and env vars
- Use HTTPS in production; set secure cookies and proper `SameSite`
- Validate OAuth state/nonce and rotate `SESSION_SECRET` if leaked
- Apply least-privilege DB roles and create necessary indexes
- Rate-limit sensitive Remote Functions and auth routes

## Deployment

Choose one:

- Vercel/Netlify: add the corresponding SvelteKit adapter and set env vars
- Docker: build and deploy the container image (plus Postgres/Redis)
- Bare Node: `npm run build` then start with your process manager (PM2, Fly.io, etc.)

> SvelteKit adapters: https://svelte.dev/docs/kit/adapters

## Development Guide

1. Plan data structures first; define Drizzle schema and run migrations
2. Implement auth provider(s) with Arctic and session issuance
3. Build Remote Functions for server-side operations (DB, cache)
4. Compose pages using shadcn-svelte components
5. Add optimistic UI where safe; cache with Redis where useful

## References

- SvelteKit & Svelte 5: see `.windsurf/docs/sveltekit.txt`
- Drizzle ORM: see `.windsurf/docs/drizzle.txt`
- Docker: see `.windsurf/docs/docker.txt`
- Arctic OAuth: https://arcticjs.dev/

## License

MIT — see `LICENSE`.
