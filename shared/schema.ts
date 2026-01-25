import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  sizes: text("sizes").notNull(),
  colors: text("colors").notNull(),
  status: text("status").notNull().default("В наличии"),
  season: text("season").notNull().default("Все сезоны"),
  min_order_quantity: integer("min_order_quantity").notNull().default(6),
  pairs_per_box: integer("pairs_per_box").default(12),
  main_photo: text("main_photo").notNull(),
  additional_photos: text("additional_photos").array().default(sql`'{}'`),
  comment: text("comment"),
  is_bestseller: boolean("is_bestseller").default(false),
  is_new: boolean("is_new").default(false),
  gender: text("gender").notNull().default("Универсальные"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
