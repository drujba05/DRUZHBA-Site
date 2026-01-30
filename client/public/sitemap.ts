import { Router } from "express";
import { db } from "../db"; // твой экземпляр Drizzle или PG
import { products } from "../db/schema"; // таблица товаров

const router = Router();

router.get("/sitemap.xml", async (_req, res) => {
  try {
    // Берём все товары из базы
    const allProducts = await db.select().from(products);

    // Основные страницы сайта
    const pages = [
      { loc: "/", changefreq: "weekly", priority: 1.0 },
      { loc: "/catalog", changefreq: "daily", priority: 0.9 },
      { loc: "/contacts", changefreq: "monthly", priority: 0.7 },
      { loc: "/about", changefreq: "monthly", priority: 0.7 },
      { loc: "/faq", changefreq: "monthly", priority: 0.6 },
      { loc: "/delivery", changefreq: "monthly", priority: 0.6 },
    ];

    // Продукты
    const productUrls = allProducts.map((p: any) => ({
      loc: `/catalog/${p.slug}`, // или p.id, если slug нет
      changefreq: "weekly",
      priority: 0.8,
    }));

    const allUrls = [...pages, ...productUrls];

    // Формируем XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
      .map(
        (p) => `
  <url>
    <loc>https://druzhbas.live${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
      )
      .join("")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) {
    console.error("Ошибка генерации sitemap:", e);
    res.status(500).send("Ошибка генерации sitemap");
  }
});

export default router;
