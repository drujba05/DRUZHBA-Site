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

// 2. НАСТРОЙКА ХРАНИЛИЩА MULTER ДЛЯ CLOUDINARY
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

// Вспомогательная функция для отправки текста в Telegram
async function sendTelegramNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN) return false;
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
    return false;
  }
}

// Вспомогательная функция для отправки фото в Telegram
async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!TELEGRAM_BOT_TOKEN || !photoUrl) return false;
  
  // Cloudinary выдает полные ссылки, поэтому просто используем photoUrl
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

  // --- РОУТ ДЛЯ ЗАГРУЗКИ ФОТО В CLOUDINARY ---
  app.post("/api/upload", upload.single("file"), (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Файл не загружен" });
      // Возвращаем прямую ссылку на фото в облаке
      res.json({ url: req.file.path });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ message: "Ошибка при загрузке в облако" });
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

      const sent = await sendTelegramNotification(message);
      if (sent && items?.[0]?.main_photo) {
        await sendTelegramPhoto(items[0].main_photo, `Заказ от ${customerName}`);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Ошибка" });
    }
  });

  // 2. БЫСТРЫЙ ЗАКАЗ
  app.post("/api/quick-order", async (req, res) => {
    try {
      const { productId, customerName, customerPhone, color, quantity } = req.body;
      const product = await storage.getProduct(productId);
      
      const pricePerUnit = Number(product?.price) || 0;
      const totalAmount = pricePerUnit * (Number(quantity) || 1);

      const message = `⚡ <b>БЫСТРЫЙ ЗАКАЗ!</b>\n\n` +
        `👤 <b>Клиент:</b> ${customerName || "Не указано"}\n` +
        `📱 <b>Телефон:</b> ${customerPhone || "Не указано"}\n\n` +
        `📦 <b>Товар:</b> ${product?.name || "ID: " + productId}\n` +
        `🎨 <b>Цвет:</b> ${color || "Не выбран"}\n` +
        `🔢 <b>Количество:</b> ${quantity || 1} шт\n` +
        `💰 <b>Сумма:</b> ${totalAmount.toLocaleString()} сом`;

      const sent = await sendTelegramNotification(message);

      if (sent && product?.main_photo) {
        await sendTelegramPhoto(product.main_photo, `Быстрый заказ: ${product.name}`);
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка" });
    }
  });

  // 3. ТОВАРЫ (API)
  app.get("/api/products", async (_req, res) => {
    const allProducts = await storage.getProducts();
    res.json(allProducts);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    await storage.deleteProduct(req.params.id as any);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
                                                  }
        
