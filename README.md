# Tascalogo

## Run with Docker

1. Start the containers:

   ```bash
   docker compose up --build
   ```

2. Open the app in your browser:

   - http://localhost:3000

3. If this is the first time running the project, apply the database schema:

   ```bash
   docker compose exec api pnpm --filter @workspace/db run push
   ```

4. Stop the containers when you are done:

   ```bash
   docker compose down
   ```

The database runs in its own PostgreSQL container and stores data in the
`postgres_data` volume, so your information is kept between restarts.
