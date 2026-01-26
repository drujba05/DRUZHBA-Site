import { products, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    // Получаем товары из Neon
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    // Сохраняем в Neon
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        sku: insertProduct.sku ?? "",
        description: insertProduct.description ?? "",
        additional_photos: insertProduct.additional_photos ?? [],
        pairs_per_box: insertProduct.pairs_per_box ?? "",
        is_bestseller: insertProduct.is_bestseller ?? false,
        is_new: insertProduct.is_new ?? true
      })
      .returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(update)
      .where(eq(products.id, id))
      .returning();
    
    if (!updated) throw new Error("Товар не найден");
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

// ВАЖНО: Теперь используем DatabaseStorage вместо MemStorage
export const storage = new DatabaseStorage();
