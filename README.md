# Tascalogo

A restaurant tracker and gastronomic diary for exploring dining experiences across Portugal. Mark concelhos on an interactive map, log visited restaurants with ratings, and keep a wishlist of places to try.

## Features

- **Interactive Portugal map** — click any concelho to see or add entries
- **Restaurant diary** — log visits with cuisine type, rating (1–5 stars), notes and date
- **Wishlist** — save restaurants you want to try
- **Mark as visited** — convert a wishlist item into a visited restaurant and give it a rating in one click
- **Stats dashboard** — overview of concelhos visited, average rating, top cuisines and more

## Run locally with Docker

1. Start all containers (frontend, API, and database):

   ```bash
   docker compose up --build
   ```

2. Open the app in your browser:

   - http://localhost:3000

   The database schema is applied automatically on first start.

3. Stop the containers when you are done:

   ```bash
   docker compose down
   ```

The database runs in its own PostgreSQL container and stores data in the
`postgres_data` volume, so your data is kept between restarts.

## Development on Replit

The app runs automatically when you open the project — no Docker needed.
Two workflows start up:

- **Start application** — the React frontend (port 19567)
- **API Server** — the Express backend (port 8080)

The preview pane on the right shows the running app.

### First-time database setup on Replit

```bash
pnpm --filter @workspace/db run push
```

### Other useful commands

Run codegen after changing the OpenAPI spec (`lib/api-spec/openapi.yaml`):

```bash
pnpm --filter @workspace/api-spec run codegen
```

Typecheck the entire workspace:

```bash
pnpm run typecheck
```

## Tech stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS 4, Wouter, TanStack Query |
| Map       | react-simple-maps + GADM GeoJSON (bundled)      |
| Backend   | Express 5, Drizzle ORM, Zod                     |
| Database  | PostgreSQL 16                                   |
| API spec  | OpenAPI 3.1 + Orval codegen                     |
| Monorepo  | pnpm workspaces                                 |
