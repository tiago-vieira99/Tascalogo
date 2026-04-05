import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, restaurantsTable, wishlistTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  (req as any).userId = userId;
  next();
}

router.get("/restaurants", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const { concelho } = req.query as { concelho?: string };
    const results = await (concelho
      ? db.select().from(restaurantsTable).where(and(eq(restaurantsTable.userId, userId), eq(restaurantsTable.concelho, concelho)))
      : db.select().from(restaurantsTable).where(eq(restaurantsTable.userId, userId)));
    res.json(results.map(r => ({
      id: r.id,
      name: r.name,
      concelho: r.concelho,
      district: r.district,
      cuisine: r.cuisine ?? undefined,
      rating: r.rating ?? undefined,
      notes: r.notes ?? undefined,
      visitDate: r.visitDate ?? undefined,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error listing restaurants");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/restaurants", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const { name, concelho, district, cuisine, rating, notes, visitDate } = req.body;
    if (!name || !concelho || !district) {
      return res.status(400).json({ error: "name, concelho e district são obrigatórios" });
    }
    const [created] = await db.insert(restaurantsTable).values({
      userId,
      name,
      concelho,
      district,
      cuisine: cuisine || null,
      rating: rating ? Number(rating) : null,
      notes: notes || null,
      visitDate: visitDate || null,
    }).returning();
    res.status(201).json({
      id: created.id,
      name: created.name,
      concelho: created.concelho,
      district: created.district,
      cuisine: created.cuisine ?? undefined,
      rating: created.rating ?? undefined,
      notes: created.notes ?? undefined,
      visitDate: created.visitDate ?? undefined,
      createdAt: created.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating restaurant");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/restaurants/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const id = Number(req.params.id);
    const [restaurant] = await db.select().from(restaurantsTable).where(and(eq(restaurantsTable.id, id), eq(restaurantsTable.userId, userId)));
    if (!restaurant) {
      return res.status(404).json({ error: "Não encontrado" });
    }
    res.json({
      id: restaurant.id,
      name: restaurant.name,
      concelho: restaurant.concelho,
      district: restaurant.district,
      cuisine: restaurant.cuisine ?? undefined,
      rating: restaurant.rating ?? undefined,
      notes: restaurant.notes ?? undefined,
      visitDate: restaurant.visitDate ?? undefined,
      createdAt: restaurant.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting restaurant");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/restaurants/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const id = Number(req.params.id);
    const { name, concelho, district, cuisine, rating, notes, visitDate } = req.body;
    if (!name || !concelho || !district) {
      return res.status(400).json({ error: "name, concelho e district são obrigatórios" });
    }
    const [updated] = await db.update(restaurantsTable).set({
      name,
      concelho,
      district,
      cuisine: cuisine || null,
      rating: rating ? Number(rating) : null,
      notes: notes || null,
      visitDate: visitDate || null,
    }).where(and(eq(restaurantsTable.id, id), eq(restaurantsTable.userId, userId))).returning();
    if (!updated) {
      return res.status(404).json({ error: "Não encontrado" });
    }
    res.json({
      id: updated.id,
      name: updated.name,
      concelho: updated.concelho,
      district: updated.district,
      cuisine: updated.cuisine ?? undefined,
      rating: updated.rating ?? undefined,
      notes: updated.notes ?? undefined,
      visitDate: updated.visitDate ?? undefined,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating restaurant");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.delete("/restaurants/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const id = Number(req.params.id);
    await db.delete(restaurantsTable).where(and(eq(restaurantsTable.id, id), eq(restaurantsTable.userId, userId)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting restaurant");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/wishlist", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const { concelho } = req.query as { concelho?: string };
    const results = await (concelho
      ? db.select().from(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.concelho, concelho)))
      : db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId)));
    res.json(results.map(r => ({
      id: r.id,
      name: r.name,
      concelho: r.concelho,
      district: r.district,
      cuisine: r.cuisine ?? undefined,
      notes: r.notes ?? undefined,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error listing wishlist");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/wishlist", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const { name, concelho, district, cuisine, notes } = req.body;
    if (!name || !concelho || !district) {
      return res.status(400).json({ error: "name, concelho e district são obrigatórios" });
    }
    const [created] = await db.insert(wishlistTable).values({
      userId,
      name,
      concelho,
      district,
      cuisine: cuisine || null,
      notes: notes || null,
    }).returning();
    res.status(201).json({
      id: created.id,
      name: created.name,
      concelho: created.concelho,
      district: created.district,
      cuisine: created.cuisine ?? undefined,
      notes: created.notes ?? undefined,
      createdAt: created.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating wishlist item");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.delete("/wishlist/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const id = Number(req.params.id);
    await db.delete(wishlistTable).where(and(eq(wishlistTable.id, id), eq(wishlistTable.userId, userId)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting wishlist item");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const restaurants = await db.select().from(restaurantsTable).where(eq(restaurantsTable.userId, userId));
    const wishlist = await db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));

    const totalRestaurants = restaurants.length;
    const totalWishlist = wishlist.length;
    const uniqueConcelhos = new Set(restaurants.map(r => r.concelho)).size;

    const ratings = restaurants.filter(r => r.rating !== null).map(r => r.rating as number);
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0;

    const cuisineCounts: Record<string, number> = {};
    for (const r of restaurants) {
      if (r.cuisine) {
        cuisineCounts[r.cuisine] = (cuisineCounts[r.cuisine] || 0) + 1;
      }
    }
    const topCuisines = Object.entries(cuisineCounts)
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const concelhosCounts: Record<string, number> = {};
    for (const r of restaurants) {
      concelhosCounts[r.concelho] = (concelhosCounts[r.concelho] || 0) + 1;
    }
    const mostVisitedConcelhos = Object.entries(concelhosCounts)
      .map(([concelho, count]) => ({ concelho, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalRestaurants,
      totalConcelhos: uniqueConcelhos,
      totalWishlist,
      avgRating,
      topCuisines,
      mostVisitedConcelhos,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting stats");
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
