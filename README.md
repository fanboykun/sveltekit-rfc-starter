# SvelteKit SaaS Starter (Svelte 5 + Remote Functions)

<p align="center"><strong>Launch production-ready SvelteKit apps faster — Svelte 5 runes, Remote Functions, Arctic/Lucia OAuth, Drizzle ORM, Redis, and Tailwind v4/shadcn — all wired for a Docker-first DX.</strong></p>

<p align="center">
  <a href="https://svelte.dev" title="Svelte">
    <img src="https://cdn.simpleicons.org/svelte/FF3E00" alt="Svelte" height="28" />
  </a>
  &nbsp;
  <a href="https://tailwindcss.com" title="Tailwind CSS">
    <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" alt="Tailwind CSS" height="28" />
  </a>
  &nbsp;
  <a href="https://www.shadcn-svelte.com" title="shadcn-svelte">
    <img src="https://cdn.simpleicons.org/shadcnui/000000" alt="shadcn" height="28" />
  </a>
  &nbsp;
  <a href="https://orm.drizzle.team" title="Drizzle ORM">
    <img src="https://cdn.simpleicons.org/drizzle/F7DF1E" alt="Drizzle ORM" height="28" />
  </a>
  &nbsp;
  <a href="https://www.postgresql.org" title="PostgreSQL">
    <img src="https://cdn.simpleicons.org/postgresql/4169E1" alt="PostgreSQL" height="28" />
  </a>
  &nbsp;
  <a href="https://redis.io" title="Redis">
    <img src="https://cdn.simpleicons.org/redis/DC382D" alt="Redis" height="28" />
  </a>
  &nbsp;
  <a href="https://lucia-auth.com" title="Lucia (Auth)">
    <img src="https://cdn.simpleicons.org/lucia/000000" alt="Lucia" height="28" />
  </a>
  &nbsp;
  <a href="https://www.docker.com" title="Docker">
    <img src="https://cdn.simpleicons.org/docker/2496ED" alt="Docker" height="28" />
  </a>
  &nbsp;
  <a href="https://www.typescriptlang.org" title="TypeScript">
    <img src="https://cdn.simpleicons.org/typescript/3178C6" alt="TypeScript" height="28" />
  </a>
</p>

## Screenshots

<p align="center">
  <img src="static/screenshots/landing.png" alt="Landing page" width="880" />
</p>
<p align="center">
  <img src="static/screenshots/dashboard.png" alt="Dashboard" width="880" />
</p>

Modern SvelteKit 2 starter kit for building SaaS apps with:

- Svelte 5 (runes) and SvelteKit 2
- Remote Functions for secure server calls from the client
- OAuth via Arctic (arcticjs.dev)
- Drizzle ORM + PostgreSQL
- Redis (ioredis) for sessions/cache/queues
- Tailwind CSS v4 + shadcn-svelte components

This repository is designed as a template to bootstrap production-ready SvelteKit apps with batteries included, strong defaults, and a clean architecture.

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

Note: Some logos (e.g., Arctic) may not be on Simple Icons; we include Lucia/OpenID as auth stand-ins.

## Project Structure

This template follows a conventional SvelteKit layout and keeps server-only logic out of the client bundle.

- `src/routes` — app routes (pages, endpoints)
- `src/lib` — shared code (components, hooks, utils, constants)
- `src/lib/remotes` — Remote Functions definitions (server-only)
- `src/lib/server` — server-only modules (DB, Redis, auth, services)
- `src/lib/server/auth` — Arctic OAuth setup (providers, session utils)
- `src/lib/server/db` — Drizzle schema and client
- `src/lib/server/redis` — Redis client (ioredis)
- `src/lib/server/services` — domain-specific server services
- `src/lib/shared` — isomorphic utilities/constants/schemas
- `drizzle/` — migration files
- `static/` — static assets

### Detailed Project Structure

```text
.
├─ src/
│  ├─ routes/                                 # Pages & endpoints
│  │  ├─ +layout.svelte                       # Root layout
│  │  ├─ +layout.server.ts                    # Root server load (e.g., session)
│  │  ├─ +page.svelte                         # Landing page
│  │  ├─ auth/
│  │  │  ├─ login/
│  │  │  │  ├─ +page.svelte                   # Login UI
│  │  │  │  └─ +page.server.ts                # Login server action/loader
│  │  │  └─ callback/[provider=auth_provider]/
│  │  │     └─ +server.ts                     # OAuth callback endpoint
│  │  └─ dashboard/                           # Example protected area
│  │     ├─ +layout.svelte
│  │     ├─ +layout.server.ts
│  │     └─ +page.svelte
│  ├─ lib/
│  │  ├─ assets/                              # Images/icons used by components
│  │  ├─ components/                          # UI components (shadcn-svelte, layouts)
│  │  ├─ hooks/                               # Utility hooks (Svelte 5 runes aware)
│  │  ├─ remotes/
│  │  │  └─ auth/auth.remote.ts               # Remote Functions (login/logout)
│  │  ├─ server/                              # Server-only modules
│  │  │  ├─ auth/
│  │  │  │  ├─ core/                          # Auth core types/config/instance
│  │  │  │  ├─ providers/                     # Google/GitHub providers
│  │  │  │  ├─ sessions/                      # Redis session manager
│  │  │  │  └─ index.ts                       # Auth entry point
│  │  │  ├─ db/                               # Drizzle client & schema
│  │  │  ├─ middlewares/                      # Route/server middlewares/guards
│  │  │  ├─ redis/                            # Redis client (ioredis)
│  │  │  └─ services/                         # Domain services (server-only)
│  │  ├─ shared/                              # Isomorphic utilities/constants/schemas
│  │  │  ├─ constants/
│  │  │  ├─ schemas/
│  │  │  └─ utils/
│  ├─ params/                                  # Route param matchers (e.g., auth_provider)
│  │  ├─ auth_provider.ts
│  │  ├─ numeric.ts
│  │  ├─ slugable.ts
│  │  └─ uuid.ts
│  ├─ hooks.server.ts                          # Init + set user in locals from session
│  └─ app.d.ts                                 # App Locals/types
├─ drizzle/                                    # SQL migrations
├─ docker/
│  └─ docker-compose.dev.yml                   # Postgres + Redis for local dev
├─ static/                                     # Static assets
├─ components.json                             # shadcn-svelte config (aliases)
├─ Makefile                                    # Docker helpers (make up/down/dev/...)
├─ .env.example                                # Example env vars (copy to .env)
└─ README.md                                   # This file
```

Note: exact folders may evolve; the separation between client-safe and server-only code is intentional to keep secrets and heavy deps off the client.

## Prerequisites

- JavaScript runtime: Bun (recommended) or Node.js 18+
- Docker Desktop/Engine: required for local Postgres and Redis via Compose

You do NOT need to install PostgreSQL or Redis locally; this starter runs them in Docker for you.

## Quick Start

First time setup (build containers once, start services, and run the app):

```bash
git clone <this-repo-url> my-app
cd my-app
bun install                 # package manager is Bun (use `bun` for scripts)
cp .env.example .env        # then fill in environment variables (see below)

# Build service images (Postgres, Redis) and create containers
make build

# Start Postgres & Redis, then run the app (Bun by default)
make dev
```

Open http://localhost:5173 (or the port printed in your terminal).

## Local Development (Docker + Makefile)

Start here:

```bash
make dev
```

The `dev` target will:

- Ensure required containers exist and are running (`make check`)
- Spin up Postgres (5432) and Redis (6379) via docker-compose
- Start the SvelteKit dev server using Bun (configured in the Makefile)

Other useful targets:

```bash
make build       # build service images (first run or when docker files change)
make up          # start Postgres & Redis in the background
make down        # stop and remove containers
make restart     # restart containers
make logs        # follow logs for all services
make redis-flush # flush all Redis data (dev only)
```

Suggested local env values when using Docker services:

```bash
DATABASE_URL=postgres://postgres:123@localhost:5432/starter
REDIS_URL=redis://localhost:6379
```

Note: `make dev` uses Bun (DEV_COMMAND in Makefile). You can still run `npm run dev` if you prefer Node/npm; just ensure `make up` has started the services first.

## Environment Variables

Use a local `.env` (copy from `.env.example`) and set the following. Names are UPPERCASE by convention.

Required for core app:

- `DATABASE_URL` — PostgreSQL connection string
  - Example (Docker dev): `postgresql://postgres:123@localhost:5432/starter`
  - Used in: `src/lib/server/db/index.ts`, `drizzle.config.ts`
- `REDIS_URL` — Redis connection string
  - Example (Docker dev): `redis://localhost:6379`
  - Used in: `src/lib/server/redis/redis.ts`
- `AUTH_SECRET` — long random string to sign the auth session cookie
  - Generate: `openssl rand -base64 32` or `bunx nanoid`

OAuth (enable providers you use):

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

Dev helper:

- `MOCK_LOGIN` — if `true`, enables mock login flows for local development only, disabling the OAuth.

SvelteKit env access:

- Server-only: `$env/dynamic/private` (used in this repo)
- Build-time server-only: `$env/static/private`
- Never expose secrets to the client (`$env/static/public` is not used here)

Security:

- Keep secrets out of the client; read them only from server modules (`src/lib/server/**`)
- Never commit `.env`; commit `.env.example` to document variables

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

Note: `drizzle-kit migrate` does not create the database itself. Ensure the target database exists before running migrations. If you use the provided Docker setup, create it once with:

```bash
docker exec -it starter-postgres psql -U postgres -c "CREATE DATABASE starter;"
```

Use transactions for multi-step writes and create indexes for critical queries. See `.windsurf/docs/drizzle.txt` for detailed Drizzle notes.

## Redis (ioredis)

Use Redis for:

- Session persistence (if not using cookies-only)
- Caching expensive queries
- Background job queues

Create a single connection in `src/lib/server/redis/redis.ts` and reuse it across server modules.

## Authentication with Arctic

This project implements OAuth using the Arctic library (OAuth 2.0/OpenID; state, nonce, and PKCE where supported). For Arctic docs, see: https://arcticjs.dev/

Why this approach (and not Better Auth):

- Full control over auth and business logic; no third-party framework taking over your app flow
- Session storage in Redis for durability, revocation, and cross-instance scaling

Implementation overview:

- Providers: `src/lib/server/auth/providers/{google,github}.ts`
- Core & wiring: `src/lib/server/auth/core/*`, `src/lib/server/auth/index.ts`
- Sessions: `src/lib/server/auth/sessions/redis-session.ts` (signed cookie + Redis)
- Remote functions: `src/lib/remotes/auth/auth.remote.ts` (login/logout)
- Param matcher: `src/params/auth_provider.ts`
- Locals: `src/hooks.server.ts` (loads `event.locals.user` from session)

Customize or extend:

- Add a provider: create `src/lib/server/auth/providers/<provider>.ts`, export it, and register in `src/lib/server/auth/index.ts`; set `<PROVIDER>_CLIENT_ID/_SECRET` envs
- Swap session store: implement a new session manager (extend BaseSession) and wire it in `index.ts`
- Adjust guards: add/modify route guards or checks where you call remote functions or in hooks
- Tune cookies: adjust cookie options and TTL in the session manager if your deployment needs differ

Flow in this repo (simplified):

1. `auth.handleLogin` builds provider URL with callback `${origin}/auth/callback/<provider>` and redirects
2. Callback validates state/nonce (and PKCE if applicable), maps user, upserts DB, issues Redis-backed session cookie
3. `auth.handleLogout` clears Redis state and deletes cookie

Refer to Arctic docs for provider specifics and advanced flows.

### Security notes (recommended)

- Always run behind HTTPS in production; set `secure` cookies and appropriate `SameSite`
- Cookies: `httpOnly`, `sameSite=lax`, `secure` (prod); short TTLs for sensitive cookies
- Rotate `AUTH_SECRET` if compromised; invalidate sessions in Redis on rotation
- Keep provider scopes minimal; validate `state`/`nonce` and enforce PKCE where supported
- Rate-limit auth endpoints and remote functions that touch auth/session

### Create, add, and register a new OAuth provider

1. Prepare credentials and callback

- Create an app on the provider dashboard
- Set Redirect URI to `${ORIGIN}/auth/callback/<provider>` (example: `http://localhost:5173/auth/callback/myprovider`)
- Collect `<PROVIDER>_CLIENT_ID` and `<PROVIDER>_CLIENT_SECRET` and add them to `.env`

2. Create the provider adapter

- File: `src/lib/server/auth/providers/<provider>.ts`
- Implement the Provider adapter using Arctic (configure scopes as needed) and map the provider profile to your internal user shape

3. Export and register

- Export it in `src/lib/server/auth/providers/index.ts`
- Register it in `src/lib/server/auth/index.ts` (see example above)
- Add `<provider>` to the param matcher in `src/params/auth_provider.ts` so callbacks are accepted
- Update the client-safe enum: add/remove the provider key in `src/lib/shared/constants/enum.ts` (`AuthProvider`). This keeps client code (UI, forms) in sync with server providers.

4. Add UI and test

- Add a "Sign in with <Provider>" button that calls the login remote with `{ provider: '<provider>' }`
- Run `make dev`, complete the OAuth flow, and confirm a session is created

Notes:

- Choose minimal scopes; request extra scopes only when necessary
- If the provider returns email unverified or missing, consider fallbacks or additional API calls
- Keep error handling explicit; log and surface a generic message to the user

### Swap the session manager

You can replace Redis-backed sessions with your own storage by implementing a new manager.

Steps:

1. Implement a manager
   - Create `src/lib/server/auth/sessions/<name>-session.ts`
   - Extend `BaseSession` and implement: `getSession`, `setSession`, `deleteSession`
   - Respect cookie settings from `BaseSession` (name, `httpOnly`, `sameSite`, `secure`)
2. Wire it up
   - In `src/lib/server/auth/index.ts`, import your manager and pass an instance to `AuthInstance`
   - Adjust env vars as needed (e.g., connection strings)
3. Migrate data (if needed)
   - If changing stores in production, consider a short dual-read period or invalidate old sessions

## Remote Functions

We use SvelteKit Remote Functions to call server code from the client safely and with types, without hand-rolling endpoints.

- Why: strong typing, automatic serialization, origin/auth enforcement, smaller client surface.
- Where: `src/lib/remotes/*` (server-only code that never ships to the browser).
- How: invoked via SvelteKit’s built-in remote-call mechanism; not exposed as public REST routes.

See `.windsurf/docs/sveltekit.txt` for a concise reference to SvelteKit 2 Remote Functions.

## UI: Tailwind v4 + shadcn-svelte

- Tailwind v4 is preconfigured
- shadcn-svelte provides accessible, themeable components

Usage:

- Add components via shadcn-svelte CLI
- Keep styles in `src/app.css` and component-level styles minimal

## License

MIT — see `LICENSE`.
