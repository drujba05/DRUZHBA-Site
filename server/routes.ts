import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. КОНФИГУРАЦИЯ CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. НАСТРОЙКА ХРАНИЛИЩА MULTER
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const upload = multer({ storage: cloudinaryStorage });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "5356415783";

// Вспомогательная функция для текста
async function sendTelegramNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
    const result = await response.json();
    return result.ok;
  } catch (error) {
    return false;
  }
}

// Вспомогательная функция для фото
async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!TELEGRAM_BOT_TOKEN || !photoUrl) return false;
  const finalUrl = photoUrl.startsWith('http') 
    ? photoUrl 
    : `https://druzhbas.live${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo: finalUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("Telegram Photo Error:", e);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  registerObjectStorageRoutes(app);

  // ЗАГРУЗКА ФОТО
  app.post("/api/upload", upload.single("file"), (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "Файл не загружен" });
      res.json({ success: true, url: req.file.path });
    } catch (error) {
      res.status(500).json({ success: false, message: "Ошибка облака" });
    }
  });

  // 1. КОРЗИНА
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

  // 2. БЫСТРЫЙ ЗАКАЗ (ДОРАБОТАННЫЙ)
  app.post("/api/quick-order", async (req, res) => {
    try {
      const { productId, customerName, customerPhone, color, quantity } = req.body;
      
      // Ищем товар по строковому ID
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

      // Сначала отправляем уведомление
      await sendTelegramNotification(message);

      // Потом фото (если есть)
      if (product?.main_photo) {
        await sendTelegramPhoto(product.main_photo, `Быстрый заказ: ${product.name}`);
      }

      // ОЧЕНЬ ВАЖНО: Всегда отвечаем успехом, чтобы фронтенд закрыл модалку
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Quick Order Error:", error);
      // Если ошибка — тоже отвечаем JSON-ом, чтобы фронтенд не «висел»
      return res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
  });

  // 3. ТОВАРЫ
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
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (e) {
      res.status(500).json({ message: "Ошибка создания" });
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
    
