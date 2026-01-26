import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// 1. КОНФИГУРАЦИЯ CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Настройка Multer для работы с памятью (самый надежный вариант для Railway)
const upload = multer({ storage: multer.memoryStorage() });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "5356415783";

// Вспомогательная функция для текста в Telegram
async function sendTelegramNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN) return false;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Telegram Notification Error:", error);
  }
}

// Вспомогательная функция для фото в Telegram
async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!TELEGRAM_BOT_TOKEN || !photoUrl) return false;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo: photoUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("Telegram Photo Error:", e);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // --- НОВАЯ ЗАГРУЗКА ФОТО (Cloudinary) ---
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Файл не получен" });
      }

      // Оптимизированный метод отправки в облако через Base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "products",
      });

      res.json({ success: true, url: result.secure_url });
    } catch (error: any) {
      console.error("Cloudinary Error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Ошибка облака", 
        details: error.message 
      });
    }
  });

  // 1. ЗАКАЗ ЧЕРЕЗ КОРЗИНУ
  app.post("/api/orders", async (req, res) => {
    try {
      const { items, customerName, customerPhone, totalPrice } = req.body;
      const itemsList = items?.map((item: any) => 
        `  • ${item.name}${item.selectedColor ? ` (${item.selectedColor})` : ""} — ${item.quantity} шт`
      ).join("\n");

      const message = `🛒 <b>НОВЫЙ ЗАКАЗ ИЗ КОРЗИНЫ!</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName}\n` +
        `📱 <b>Телефон:</b> ${customerPhone}\n\n` +
        `📦 <b>Товары:</b>\n${itemsList}\n\n` +
        `💰 <b>Итого:</b> ${totalPrice} сом`;

      await sendTelegramNotification(message);
      if (items?.[0]?.main_photo) {
        await sendTelegramPhoto(items[0].main_photo, `Заказ от ${customerName}`);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  // 2. БЫСТРЫЙ ЗАКАЗ
  app.post("/api/quick-order", async (req, res) => {
    try {
      const { productId, customerName, customerPhone, color, quantity } = req.body;
      const product = await storage.getProduct(productId);
      
      const pricePerUnit = Number(product?.price) || 0;
      const qty = Number(quantity) || 1;
      const totalAmount = pricePerUnit * qty;

      const message = `⚡ <b>БЫСТРЫЙ ЗАКАЗ!</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName || "Не указано"}\n` +
        `📱 <b>Телефон:</b> ${customerPhone || "Не указано"}\n\n` +
        `📦 <b>Товар:</b> ${product?.name || "ID: " + productId}\n` +
        `🎨 <b>Цвет:</b> ${color || "Не выбран"}\n` +
        `🔢 <b>Количество:</b> ${qty} шт\n` +
        `💰 <b>Сумма:</b> ${totalAmount.toLocaleString()} сом`;

      await sendTelegramNotification(message);
      if (product?.main_photo) {
        await sendTelegramPhoto(product.main_photo, `Быстрый заказ: ${product.name}`);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Quick Order Error:", error);
      return res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
  });

  // 3. API ДЛЯ ТОВАРОВ
  app.get("/api/products", async (_req, res) => {
    try {
      const allProducts = await storage.getProducts();
      res.json(allProducts);
    } catch (e) {
      res.status(500).json({ message: "Ошибка загрузки списка" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (e) {
      res.status(500).json({ message: "Ошибка создания товара" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id as any, req.body);
      res.json(product);
    } catch (e) {
      res.status(500).json({ message: "Ошибка обновления" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id as any);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Ошибка удаления" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
