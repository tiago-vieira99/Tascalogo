import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api", router);

// In production, serve the built frontend static files and handle SPA routing
if (process.env.NODE_ENV === "production") {
  // The frontend is built to artifacts/tascalogo/dist/public relative to monorepo root.
  // process.cwd() in Docker is /app/artifacts/api-server, so we go up two levels.
  const frontendDist = path.resolve(process.cwd(), "../../artifacts/tascalogo/dist/public");

  if (existsSync(frontendDist)) {
    logger.info({ frontendDist }, "Serving frontend static files");
    app.use(express.static(frontendDist));
    // SPA fallback: any non-API route returns index.html
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  } else {
    logger.warn({ frontendDist }, "Frontend dist not found – run 'pnpm --filter @workspace/tascalogo run build' first");
  }
}

export default app;
