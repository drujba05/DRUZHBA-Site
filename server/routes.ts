import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "5356415783";

// Общая функция для текста
async function sendTelegramNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "HTML" }),
    });
    const result = await response.json();
    return result.ok;
  } catch (error) {
    return false;
  }
}

// Общая функция для фото
async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!TELEGRAM_BOT_TOKEN) return false;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, photo: photoUrl, caption: caption, parse_mode: "HTML" }),
    });
  } catch (e) {}
}

export async function registerRoutes(app: Express): Promise<Server> {
  registerObjectStorageRoutes(app);

  // 1. ОБЫЧНЫЙ ЗАКАЗ (ИЗ КОРЗИНЫ)
  app.post("/api/orders", async (req, res) => {
    try {
      const { items, customerName, customerPhone, totalPrice } = req.body;
      const itemsList = items.map((item: any) => ` • ${item.name} — ${item.quantity} шт`).join("\n");
      const message = `🛒 <b>ЗАКАЗ ИЗ КОРЗИНЫ</b>\n\n👤 ${customerName}\n📱 ${customerPhone}\n\n📦 <b>Товары:</b>\n${itemsList}\n\n💰 <b>Итого:</b> ${totalPrice} сом`;
      
      await sendTelegramNotification(message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).send("Error");
    }
  });

  // 2. БЫСТРЫЙ ЗАКАЗ (ТО, ЧТО ПРОПАЛО)
  app.post("/api/quick-order", async (req, res) => {
    try {
      const { productId, customerName, customerPhone, color } = req.body;
      const product = await storage.getProduct(productId);

      const message = `⚡ <b>БЫСТРЫЙ ЗАКАЗ</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName || "Не указано"}\n` +
        `📱 <b>Телефон:</b> ${customerPhone || "Не указано"}\n` +
        `📦 <b>Товар:</b> ${product?.name || "ID: " + productId}\n` +
        `🎨 <b>Цвет:</b> ${color || "Не выбран"}`;

      await sendTelegramNotification(message);
      
      if (product?.main_photo) {
        await sendTelegramPhoto(`https://druzhbas.live${product.main_photo}`, `Фото к быстрому заказу`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Quick order error:", error);
      res.status(500).json({ message: "Ошибка" });
    }
  });

  // 3. ТОВАРЫ (API)
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
