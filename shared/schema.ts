import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").default(""),
  category: text("category").notNull().default("Обувь"),
  description: text("description").default(""),
  price: integer("price").notNull(),
  sizes: text("sizes").notNull(),
  colors: text("colors").notNull(),
  status: text("status").notNull().default("В наличии"),
  season: text("season").default("Все сезоны"),
  gender: text("gender").default("Универсальные"),
  min_order_quantity: integer("min_order_quantity").default(6),
  pairs_per_box: text("pairs_per_box").default(""), // Убедись, что эта строка есть
  main_photo: text("main_photo").notNull(),
  additional_photos: text("additional_photos").array(),
  is_bestseller: boolean("is_bestseller").default(false),
  is_new: boolean("is_new").default(true),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
