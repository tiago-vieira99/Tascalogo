# Stage 1: Build
FROM node:24-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY artifacts/tascalogo/package.json artifacts/tascalogo/
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/db/package.json lib/db/
COPY scripts/package.json scripts/

RUN pnpm install --no-frozen-lockfile --shamefully-hoist

# Copy source code
COPY tsconfig.base.json tsconfig.json ./
COPY artifacts/tascalogo/ artifacts/tascalogo/
COPY lib/ lib/
COPY scripts/ scripts/
COPY artifacts/api-server/ artifacts/api-server/

# Build the frontend
# PORT is required by vite.config.ts at config load time (dev server port, not used in the build output)
# BASE_PATH sets the base URL prefix for the app
WORKDIR /app/artifacts/tascalogo
RUN PORT=3000 BASE_PATH=/ pnpm run build

# Stage 2: Production — serve with nginx
FROM nginx:alpine

COPY --from=builder /app/artifacts/tascalogo/dist/public /usr/share/nginx/html
COPY artifacts/tascalogo/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
