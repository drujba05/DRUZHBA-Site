import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "5356415783";

// Вспомогательная функция для отправки текста в Telegram
async function sendTelegramNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN не установлен в Variables");
    return false;
  }
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Ошибка fetch в Telegram:", error);
    return false;
  }
}

// Вспомогательная функция для отправки фото в Telegram
async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!TELEGRAM_BOT_TOKEN) return false;
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          photo: photoUrl,
          caption: caption,
          parse_mode: "HTML",
        }),
      }
    );
  } catch (error) {
    console.error("Ошибка отправки фото в Telegram:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Интеграция хранилища (Replit Object Storage)
  registerObjectStorageRoutes(app);

  // 1. ОБРАБОТКА ОБЫЧНОГО ЗАКАЗА (ИЗ КОРЗИНЫ)
  app.post("/api/orders", async (req, res) => {
    try {
      const { items, customerName, customerPhone, totalPrice } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: "Неверные данные корзины" });
      }

      const itemsList = items
        .map((item: any) => `  • ${item.name}${item.selectedColor ? ` (${item.selectedColor})` : ""} — ${item.quantity} шт`)
        .join("\n");

      const message = `🛒 <b>НОВЫЙ ЗАКАЗ ИЗ КОРЗИНЫ!</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName || "Не указано"}\n` +
        `📱 <b>Телефон:</b> ${customerPhone || "Не указано"}\n\n` +
        `📦 <b>Товары:</b>\n${itemsList}\n\n` +
        `💰 <b>Итого:</b> ${totalPrice} сом`;

      const sent = await sendTelegramNotification(message);

      if (sent) {
        // Отправляем фото первого товара для визуализации
        if (items[0]?.main_photo) {
          await sendTelegramPhoto(`https://druzhbas.live${items[0].main_photo}`, `Фото к заказу от ${customerName}`);
        }
        res.json({ success: true, message: "Заказ отправлен" });
      } else {
        res.status(500).json({ success: false, message: "Ошибка Telegram API" });
      }
    } catch (error) {
      console.error("Ошибка Order API:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  // 2. ОБРАБОТКА БЫСТРОГО ЗАКАЗА (В ОДИН КЛИК)
  app.post("/api/quick-order", async (req, res) => {
    try {
      console.log("Входящие данные быстрого заказа:", req.body);
      const { productId, customerName, customerPhone, color } = req.body;

      // Получаем данные о товаре из БД Neon
      const product = await storage.getProduct(Number(productId));

      const message = `⚡ <b>БЫСТРЫЙ ЗАКАЗ!</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName || "Не указано"}\n` +
        `📱 <b>Телефон:</b> ${customerPhone || "Не указано"}\n\n` +
        `📦 <b>Товар:</b> ${product?.name || "ID: " + productId}\n` +
        `🎨 <b>Выбранный цвет:</b> ${color || "Не указан"}\n` +
        `💰 <b>Цена:</b> ${product?.price || "---"} сом`;

      const sent = await sendTelegramNotification(message);

      if (sent) {
        if (product?.main_photo) {
          await sendTelegramPhoto(`https://druzhbas.live${product.main_photo}`, `Фото быстрого заказа: ${product.name}`);
        }
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error("Ошибка Quick Order API:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  // 3. API ТОВАРОВ
  app.get("/api/products", async (_req, res) => {
    try {
      const allProducts = await storage.getProducts();
      res.json(allProducts);
    } catch (e) {
      res.status(500).json({ message: "Ошибка загрузки" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(parsed.error);
      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (e) {
      res.status(500).json({ message: "Ошибка создания" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Ошибка удаления" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
  }
