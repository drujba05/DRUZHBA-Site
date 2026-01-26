import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Получение всех товаров
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (e) {
      res.status(500).json({ message: "Ошибка при получении товаров" });
    }
  });

  // Добавление товара
  app.post("/api/products", async (req, res) => {
    try {
      // Валидация данных через схему
      const result = insertProductSchema.safeParse(req.body);
      
      if (!result.success) {
        console.error("Ошибка валидации:", result.error.format());
        return res.status(400).json({ 
          message: "Неверный формат данных", 
          errors: result.error.format() 
        });
      }

      const product = await storage.createProduct(result.data);
      res.status(201).json(product);
    } catch (e: any) {
      console.error("Ошибка сервера при создании:", e);
      res.status(500).json({ message: e.message || "Ошибка сервера" });
    }
  });

  // Обновление товара
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ message: "Ошибка при обновлении" });
    }
  });

  // Удаление товара
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ message: "Ошибка при удалении" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
    }
