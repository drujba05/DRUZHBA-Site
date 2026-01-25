import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // Пытаемся найти папку 'dist' в корне или 'public' в server
  const distPath = path.resolve(__dirname, "..", "dist");
  const publicPath = path.resolve(__dirname, "public");
  
  const finalPath = fs.existsSync(distPath) ? distPath : publicPath;

  if (!fs.existsSync(finalPath)) {
    // Если папки нет, сервер не упадет сразу, а выведет инфо в консоль
    console.log(`Warning: Build directory not found at ${finalPath}`);
    return;
  }

  app.use(express.static(finalPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(finalPath, "index.html"));
  });
}
