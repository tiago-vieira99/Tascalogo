import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgStore = ConnectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgStore({
    pool,
    tableName: "session",
  }),
  secret: process.env.SESSION_SECRET || "tascalogo-dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    sameSite: "lax",
    path: "/",
  },
});

declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
    userName?: string;
  }
}
