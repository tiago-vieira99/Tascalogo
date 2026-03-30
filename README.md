# Tascalogo

Monorepo pnpm workspace for the Tascalogo app.

## Runtime requirements

- Node.js 24
- pnpm 10
- PostgreSQL

## Docker deployment

For deployment, keep the website, API server, and database in separate containers.
This makes the app easier to update and lets the database persist independently.

### Recommended container layout

- `web` container: serves the Tascalogo frontend
- `api` container: runs the Express API server
- `db` container: runs PostgreSQL with a persistent volume

### Why use a database volume

Use a named Docker volume for PostgreSQL so data survives container restarts,
upgrades, or re-creates. Without a volume, the database contents are lost when
the container is removed.

### Example `docker-compose.yml`

```yaml
services:
  web:
    build:
      context: .
      dockerfile: artifacts/tascalogo/Dockerfile
    environment:
      - BASE_PATH=/
    ports:
      - "3000:80"
    depends_on:
      - api

  api:
    build:
      context: .
      dockerfile: artifacts/api-server/Dockerfile
    environment:
      - PORT=3001
      - DATABASE_URL=postgresql://tascalogo:tascalogo_password@db:5432/tascalogo
    ports:
      - "3001:3001"
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=tascalogo
      - POSTGRES_USER=tascalogo
      - POSTGRES_PASSWORD=tascalogo_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deployment notes

- The API server requires `PORT` and `DATABASE_URL`.
- The database container must use a persistent volume like `postgres_data`.
- The frontend build uses Vite and should be served as static files in production.
- If you change the public path of the website, keep `BASE_PATH` aligned with the deployed URL.

### Suggested build flow

1. Build the frontend image.
2. Build the API server image.
3. Start PostgreSQL with the named volume attached.
4. Start the API server and frontend containers.
5. Run database migrations or schema pushes before exposing the app.

## Project structure

- `artifacts/tascalogo` - frontend website
- `artifacts/api-server` - Express API server
- `lib/db` - PostgreSQL / Drizzle database layer
- `lib/api-spec` - OpenAPI and code generation
- `lib/api-client-react` - generated React Query client
- `lib/api-zod` - generated Zod schemas
- `scripts` - workspace scripts
