import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  concelho: text("concelho").notNull(),
  district: text("district").notNull(),
  cuisine: text("cuisine"),
  rating: integer("rating"),
  notes: text("notes"),
  visitDate: text("visit_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRestaurantSchema = createInsertSchema(restaurantsTable).omit({ id: true, createdAt: true });
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurantsTable.$inferSelect;
