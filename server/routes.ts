import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "5356415783";

async function sendTelegramNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
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
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}

async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return false;
  }

  try {
    const response = await fetch(
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

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Failed to send Telegram photo:", error);
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerObjectStorageRoutes(app);
  
  app.post("/api/orders", async (req, res) => {
    try {
      const { items, customerName, customerPhone, totalPrice } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Корзина пуста" });
      }

      const itemsList = items
        .map((item: any) => `  • ${item.name}${item.selectedColor ? ` (${item.selectedColor})` : ""} — ${item.quantity} пар (${item.price * item.quantity} сом)`)
        .join("\n");

      const message = `🛒 <b>НОВЫЙ ЗАКАЗ!</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName || "Не указано"}\n` +
        `📱 <b>Телефон:</b> ${customerPhone || "Не указано"}\n\n` +
        `📦 <b>Товары:</b>\n${itemsList}\n\n` +
        `💰 <b>Итого:</b> ${totalPrice} сом\n\n` +
        `📅 ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Bishkek" })}`;

      const sent = await sendTelegramNotification(message);

      if (sent && items.length > 0) {
        for (const item of items) {
          if (item.main_photo) {
            const fullPhotoUrl = `https://druzhbas.live${item.main_photo}`;
            await sendTelegramPhoto(fullPhotoUrl, `📷 ${item.name}${item.selectedColor ? ` (${item.selectedColor})` : ""} — ${item.quantity} пар`);
          }
        }
      }

      if (sent) {
        res.json({ success: true, message: "Заказ отправлен" });
      } else {
        res.status(500).json({ success: false, message: "Ошибка отправки уведомления" });
      }
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.post("/api/orders/quick", async (req, res) => {
    try {
      const { productName, productSku, quantity, selectedColor, customerName, customerPhone, totalPrice, productPhoto } = req.body;

      const caption = `🛒 <b>БЫСТРЫЙ ЗАКАЗ!</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName || "Не указано"}\n` +
        `📱 <b>Телефон:</b> ${customerPhone || "Не указано"}\n\n` +
        `📦 <b>Товар:</b> ${productName} (${productSku})\n` +
        (selectedColor ? `🎨 <b>Цвет:</b> ${selectedColor}\n` : "") +
        `🔢 <b>Количество:</b> ${quantity} пар\n\n` +
        `💰 <b>Сумма:</b> ${totalPrice} сом\n\n` +
        `📅 ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Bishkek" })}`;

      let sent = false;
      
      if (productPhoto) {
        const fullPhotoUrl = `https://druzhbas.live${productPhoto}`;
        sent = await sendTelegramPhoto(fullPhotoUrl, caption);
        if (!sent) {
          sent = await sendTelegramNotification(caption);
        }
      } else {
        sent = await sendTelegramNotification(caption);
      }

      if (sent) {
        res.json({ success: true, message: "Заказ отправлен" });
      } else {
        res.status(500).json({ success: false, message: "Ошибка отправки уведомления" });
      }
    } catch (error) {
      console.error("Quick order error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "druzhba2024";
    
    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Неверный пароль" });
    }
  });

  app.get("/api/health", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json({ status: "ok", db: "connected", productCount: products.length });
    } catch (error: any) {
      console.error("Health check failed:", error.message);
      res.status(500).json({ status: "error", db: "disconnected", error: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching products:", error.message, error.stack);
      res.status(500).json({ message: "Ошибка загрузки товаров", error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Неверные данные товара", errors: parsed.error.errors });
      }
      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Ошибка создания товара" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertProductSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Неверные данные товара", errors: parsed.error.errors });
      }
      const product = await storage.updateProduct(id, parsed.data);
      if (!product) {
        return res.status(404).json({ message: "Товар не найден" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Ошибка обновления товара" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Товар не найден" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Ошибка удаления товара" });
    }
  });

  return httpServer;
}
