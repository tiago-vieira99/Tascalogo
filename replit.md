# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (via @clerk/express + @clerk/react)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── tascalogo/          # React + Vite frontend app (restaurant tracker)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Tascálogo App

A personal restaurant tracker for Portugal:
- Interactive SVG map of Portugal (308 concelhos) using react-simple-maps
- Register visited restaurants per concelho with rating, cuisine, notes
- Wishlist of restaurants to visit
- Stats page with charts (recharts)
- Authentication with Clerk — each user sees only their own data

### Key Features
- Each user logs in (Google OAuth or email) via Clerk
- All API routes are protected: require Clerk session, filter by `userId`
- `restaurants` and `wishlist` tables have a `user_id` column

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, Clerk middleware, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/restaurants.ts` exposes restaurant/wishlist/stats CRUD
- All routes protected by `requireAuth` middleware using `getAuth` from `@clerk/express`
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@clerk/express`

### `artifacts/tascalogo` (`@workspace/tascalogo`)

React + Vite frontend.

- Auth: `@clerk/react` — ClerkProvider in App.tsx, sign-in/sign-up pages, Layout has user info + logout button
- Map: `react-simple-maps` — Portugal concelhos GeoJSON from GitHub CDN
- Charts: `recharts` — stats page
- Routing: `wouter` with base path from `import.meta.env.BASE_URL`
- Data: `@tanstack/react-query` + generated hooks from `@workspace/api-client-react`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- `src/schema/restaurants.ts` — restaurants table (id, userId, name, concelho, district, cuisine, rating, notes, visitDate, createdAt)
- `src/schema/wishlist.ts` — wishlist table (id, userId, name, concelho, district, cuisine, notes, createdAt)
- Production migrations are handled by Replit when publishing.
- In development, use `pnpm --filter @workspace/db run push` for schema pushes.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec. Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package.

## Auth Setup

Clerk is used for authentication:
- Server: `@clerk/express` with `clerkMiddleware()` mounted in `app.ts`, Clerk proxy at `/__clerk`
- Client: `@clerk/react` with `ClerkProvider` using `VITE_CLERK_PUBLISHABLE_KEY`
- Env vars auto-provisioned: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
