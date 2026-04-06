import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import pinoHttp from "pino-http";
import { sessionMiddleware } from "./middlewares/session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the reverse proxy (Replit, nginx, etc.) so req.secure and cookies work correctly
app.set("trust proxy", 1);

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

app.use(cors({
  credentials: true,
  origin: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);

app.use("/api", router);

// In production, serve the built frontend static files and handle SPA routing
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(process.cwd(), "../../artifacts/tascalogo/dist/public");
  if (existsSync(frontendDist)) {
    logger.info({ frontendDist }, "Serving frontend static files");
    app.use(express.static(frontendDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  } else {
    logger.warn({ frontendDist }, "Frontend dist not found – run 'pnpm --filter @workspace/tascalogo run build' first");
  }
}

export default app;
