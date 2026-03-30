import { Router, type IRouter } from "express";
import { db, restaurantsTable, wishlistTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/restaurants", async (req, res) => {
  try {
    const { concelho } = req.query as { concelho?: string };
    let query = db.select().from(restaurantsTable);
    const results = await (concelho
      ? db.select().from(restaurantsTable).where(eq(restaurantsTable.concelho, concelho))
      : db.select().from(restaurantsTable));
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/restaurants", async (req, res) => {
  try {
    const { name, concelho, district, cuisine, rating, notes, visitDate } = req.body;
    if (!name || !concelho || !district) {
      return res.status(400).json({ error: "name, concelho and district are required" });
    }
    const [created] = await db.insert(restaurantsTable).values({
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/restaurants/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, id));
    if (!restaurant) {
      return res.status(404).json({ error: "Not found" });
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/restaurants/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, concelho, district, cuisine, rating, notes, visitDate } = req.body;
    if (!name || !concelho || !district) {
      return res.status(400).json({ error: "name, concelho and district are required" });
    }
    const [updated] = await db.update(restaurantsTable).set({
      name,
      concelho,
      district,
      cuisine: cuisine || null,
      rating: rating ? Number(rating) : null,
      notes: notes || null,
      visitDate: visitDate || null,
    }).where(eq(restaurantsTable.id, id)).returning();
    if (!updated) {
      return res.status(404).json({ error: "Not found" });
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/restaurants/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(restaurantsTable).where(eq(restaurantsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting restaurant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wishlist", async (req, res) => {
  try {
    const { concelho } = req.query as { concelho?: string };
    const results = await (concelho
      ? db.select().from(wishlistTable).where(eq(wishlistTable.concelho, concelho))
      : db.select().from(wishlistTable));
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wishlist", async (req, res) => {
  try {
    const { name, concelho, district, cuisine, notes } = req.body;
    if (!name || !concelho || !district) {
      return res.status(400).json({ error: "name, concelho and district are required" });
    }
    const [created] = await db.insert(wishlistTable).values({
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/wishlist/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(wishlistTable).where(eq(wishlistTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting wishlist item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wishlist/:id/mark-visited", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [item] = await db.select().from(wishlistTable).where(eq(wishlistTable.id, id));
    if (!item) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }
    const { rating, notes, visitDate } = req.body;
    const [created] = await db.insert(restaurantsTable).values({
      name: item.name,
      concelho: item.concelho,
      district: item.district,
      cuisine: item.cuisine || null,
      rating: rating ? Number(rating) : null,
      notes: notes || item.notes || null,
      visitDate: visitDate || null,
    }).returning();
    await db.delete(wishlistTable).where(eq(wishlistTable.id, id));
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
    req.log.error({ err }, "Error marking wishlist item as visited");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const restaurants = await db.select().from(restaurantsTable);
    const wishlist = await db.select().from(wishlistTable);

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
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
