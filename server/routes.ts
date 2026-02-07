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

const upload = multer({ storage: multer.memoryStorage() });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "5356415783";

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
  
  // --- НОВИНКА: ГЕНЕРАЦИЯ КАРТЫ САЙТА (SITEMAP) ДЛЯ GOOGLE ---
  // Этот блок создаст список всех твоих товаров для поисковиков
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      const baseUrl = "https://druzhbas.live";
      
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${baseUrl}/</loc>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        ${products.map(p => `
        <url>
          <loc>${baseUrl}/product/${p.id}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`).join('')}
      </urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml.trim());
    } catch (e) {
      res.status(500).end();
    }
  });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Файл не получен" });
      }
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "products",
      });
      res.json({ success: true, url: result.secure_url });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Ошибка облака" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { items, customerName, customerPhone, totalPrice } = req.body;
      const itemsList = items?.map((item: any) => 
        `  • ${item.name}${item.selectedColor ? ` (${item.selectedColor})` : ""} — ${item.quantity} шт`
      ).join("\n");
      const message = `🛒 <b>НОВЫЙ ЗАКАЗ ИЗ КОРЗИНЫ!</b>\n\n👤 <b>Клиент:</b> ${customerName}\n📱 <b>Телефон:</b> ${customerPhone}\n\n📦 <b>Товары:</b>\n${itemsList}\n\n💰 <b>Итого:</b> ${totalPrice} сом`;
      await sendTelegramNotification(message);
      if (items?.[0]?.main_photo) await sendTelegramPhoto(items[0].main_photo, `Заказ от ${customerName}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/quick-order", async (req, res) => {
    try {
      const { productId, customerName, customerPhone, color, quantity } = req.body;
      const product = await storage.getProduct(productId);
      const qty = Number(quantity) || 1;
      const totalAmount = (Number(product?.price) || 0) * qty;
      const message = `⚡ <b>БЫСТРЫЙ ЗАКАЗ!</b>\n\n👤 <b>Клиент:</b> ${customerName}\n📱 <b>Телефон:</b> ${customerPhone}\n\n📦 <b>Товар:</b> ${product?.name}\n🎨 <b>Цвет:</b> ${color}\n🔢 <b>Количество:</b> ${qty} шт\n💰 <b>Сумма:</b> ${totalAmount.toLocaleString()} сом`;
      await sendTelegramNotification(message);
      if (product?.main_photo) await sendTelegramPhoto(product.main_photo, `Быстрый заказ: ${product.name}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

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
