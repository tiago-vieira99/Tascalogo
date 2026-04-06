import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  concelho: text("concelho").notNull(),
  district: text("district").notNull(),
  cuisine: text("cuisine"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWishlistSchema = createInsertSchema(wishlistTable).omit({ id: true, createdAt: true });
export type InsertWishlistItem = z.infer<typeof insertWishlistSchema>;
export type WishlistItem = typeof wishlistTable.$inferSelect;
