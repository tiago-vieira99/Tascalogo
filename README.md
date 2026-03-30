# Tascalogo

A restaurant tracker and gastronomic diary for exploring dining experiences across Portugal.

## Running on Replit

The app runs automatically when you open the project. Two workflows start up:

- **Start application** — the React frontend (port 19567)
- **API Server** — the Express backend (port 8080)

You can see the app in the preview pane on the right.

## First-time database setup

If this is the first time running the project, apply the database schema:

```bash
pnpm --filter @workspace/db run push
```

## Development

Install dependencies (if needed):

```bash
pnpm install
```

Run codegen after changing the OpenAPI spec:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Typecheck the entire workspace:

```bash
pnpm run typecheck
```
