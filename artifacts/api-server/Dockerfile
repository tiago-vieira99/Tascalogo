# Stage 1: Build
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/tascalogo/package.json artifacts/tascalogo/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/db/package.json lib/db/
COPY scripts/package.json scripts/

RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/ artifacts/api-server/
COPY lib/ lib/
COPY scripts/ scripts/

# Build the API server bundle
WORKDIR /app/artifacts/api-server
RUN node ./build.mjs

# Stage 2: Production runtime
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
