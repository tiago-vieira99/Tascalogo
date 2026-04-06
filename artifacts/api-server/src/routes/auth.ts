import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e password são obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "A password deve ter pelo menos 6 caracteres" });
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (existing) {
      return res.status(409).json({ error: "Já existe uma conta com este email" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
    }).returning();

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name ?? undefined;

    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    req.log.error({ err }, "Error registering user");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e password são obrigatórios" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (!user) {
      return res.status(401).json({ error: "Email ou password incorretos" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email ou password incorretos" });
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name ?? undefined;

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  res.json({
    id: req.session.userId,
    email: req.session.userEmail,
    name: req.session.userName,
  });
});

export default router;
