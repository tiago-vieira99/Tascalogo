# Tascalogo

A restaurant tracker and gastronomic diary for exploring dining experiences across Portugal.

## Run locally with Docker

1. Start all containers (frontend, API, and database):

   ```bash
   docker compose up --build
   ```

2. Open the app in your browser:

   - http://localhost:3000

3. On the first run, apply the database schema:

   ```bash
   docker compose exec api pnpm --filter @workspace/db run push
   ```

4. Stop the containers when you are done:

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

Run codegen after changing the OpenAPI spec:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Typecheck the entire workspace:

```bash
pnpm run typecheck
```
