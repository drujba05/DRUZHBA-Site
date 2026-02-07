import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Вспомогательная функция для логов
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

(async () => {
  // 1. РЕГИСТРИРУЕМ API МАРШРУТЫ
  const server = await registerRoutes(app);

  // 2. ОБРАБОТКА ОШИБОК
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // 3. ГЛАВНОЕ ИСПРАВЛЕНИЕ ДЛЯ ЯНДЕКСА И СКОРОСТИ
  // Мы заставляем сервер отдавать статику ПЕРЕД запуском, чтобы роботы не получали 404
  if (process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT) {
    // Включаем сжатие для ускорения загрузки (LCP)
    serveStatic(app);
    
    // Дополнительная страховка для SPA (чтобы пути типа /catalog не давали 404)
    app.get('*', (_req, res) => {
      res.sendFile(resolve(__dirname, '..', 'client', 'dist', 'index.html'));
    });
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(server, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`Server is running on port ${port}`);
  });
})();
