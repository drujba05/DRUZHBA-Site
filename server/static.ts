import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // 1. Определяем путь к папке dist (она на уровень выше папки server)
  const distPath = path.resolve(__dirname, "..", "dist");
  
  // 2. Логируем для проверки в консоли Railway
  console.log(`Checking for build directory at: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`❌ ERROR: Build directory NOT FOUND at ${distPath}`);
    console.log("Current directory files:", fs.readdirSync(path.resolve(__dirname, "..")));
    return;
  }

  // 3. Раздаем статические файлы из папки dist
  app.use(express.static(distPath));

  // 4. Важно: для всех остальных запросов отдаем index.html (для SPA)
  app.use("*", (req, res) => {
    // Если запрос идет к API, не отдаем index.html
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Front-end build (index.html) missing");
    }
  });
}
