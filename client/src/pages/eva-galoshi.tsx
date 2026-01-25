import { Link } from "wouter";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { useEffect } from "react";

export default function EvaGaloshi() {
  useEffect(() => {
    document.title = "Галоши от производителя оптом в Кыргызстане — EVA | Druzhba";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "EVA галоши оптом от производителя в Кыргызстане. Минимальный заказ от 6 пар. Актуальные модели для оптовых покупателей.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm font-medium shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" /> На главную
            </Link>
            <span className="font-heading font-bold text-lg text-white tracking-tighter hidden md:block">DRUZHBA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/catalog">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ShoppingBag className="h-4 w-4 mr-2" /> Каталог
              </Button>
            </Link>
            <CartDrawer />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold font-heading mb-8">
          EVA галоши от производителя оптом
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          EVA галоши от производителя оптом в Кыргызстане — это выгодное решение для магазинов, торговых точек и оптовых покупателей.
          Мы предлагаем практичные и износостойкие галоши из материала EVA, которые пользуются стабильным спросом.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-bold font-heading mb-4">Почему выгодно покупать EVA галоши от производителя</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>оптовые цены без посредников</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>качественный и лёгкий материал EVA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>популярные модели для оптовых продаж</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>минимальный заказ от 6 пар</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold font-heading mb-4">Ассортимент EVA галош</h2>
          <p className="text-muted-foreground leading-relaxed">
            В каталоге представлены классические и утеплённые EVA галоши различных размеров и цветов.
            Модели подходят для реализации в магазинах и на рынках Кыргызстана.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold font-heading mb-4">Условия оптового заказа</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>продажа только оптом</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>минимальный объём заказа — от 6 пар</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>цены формируются в зависимости от количества</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold font-heading mb-4">Для кого подойдут EVA галоши оптом</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>магазины обуви</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>торговые точки на рынках</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>оптовые покупатели в Кыргызстане</span>
            </li>
          </ul>
        </section>

        <div className="mt-12 text-center">
          <Link href="/catalog">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <ShoppingBag className="mr-2 h-5 w-5" /> Перейти в каталог
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
