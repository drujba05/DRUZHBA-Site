import { users, products, type User, type InsertUser, type Product, type InsertProduct } from "@shared/schema";
import { db, queryWithRetry } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return queryWithRetry(async () => {
      try {
        return await db.select().from(products);
      } catch (error: any) {
        if (error.message?.includes('pairs_per_box')) {
          const { pool } = await import('./db');
          const result = await pool.query(`
            SELECT id, name, sku, category, description, price, sizes, colors, status, season, 
                   min_order_quantity, main_photo, additional_photos, comment, is_bestseller, is_new, gender,
                   12 as pairs_per_box
            FROM products
          `);
          return result.rows as Product[];
        }
        throw error;
      }
    });
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return queryWithRetry(async () => {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product || undefined;
    });
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    return queryWithRetry(async () => {
      const [product] = await db.insert(products).values(insertProduct).returning();
      return product;
    });
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    return queryWithRetry(async () => {
      try {
        const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
        return product || undefined;
      } catch (error: any) {
        if (error.message?.includes('pairs_per_box')) {
          const { pairs_per_box, ...updatesWithoutPairsPerBox } = updates as any;
          const { pool } = await import('./db');
          const fields = Object.keys(updatesWithoutPairsPerBox);
          const values = Object.values(updatesWithoutPairsPerBox);
          const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
          const result = await pool.query(
            `UPDATE products SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, id]
          );
          return result.rows[0] ? { ...result.rows[0], pairs_per_box: pairs_per_box || 12 } as Product : undefined;
        }
        throw error;
      }
    });
  }

  async deleteProduct(id: string): Promise<boolean> {
    return queryWithRetry(async () => {
      const result = await db.delete(products).where(eq(products.id, id)).returning();
      return result.length > 0;
    });
  }
}

export const storage = new DatabaseStorage();
