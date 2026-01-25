import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // Твои логи показали, что файлы лежат в dist/public
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  console.log(`🔎 Проверка папки сборки: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`❌ ОШИБКА: Папка ${distPath} не найдена!`);
    // Проверим, что вообще есть в dist
    const parentDist = path.resolve(__dirname, "..", "dist");
    if (fs.existsSync(parentDist)) {
      console.log("Содержимое dist:", fs.readdirSync(parentDist));
    }
    return;
  }

  // Раздаем статику из правильной папки
  app.use(express.static(distPath));

  // Маршрутизация для SPA
  app.use("*", (req, res) => {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Файл index.html отсутствует в dist/public");
    }
  });
}
