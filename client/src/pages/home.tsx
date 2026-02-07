import { useState } from "react";
import { Link } from "wouter";
import { useProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { AdminPanel } from "@/components/admin-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Phone,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Flame,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Home as HomeIcon,
} from "lucide-react";
import { CartDrawer } from "@/components/cart-drawer";
import heroImage from "@assets/generated_images/modern_aesthetic_wholesale_footwear_display_background.png";
import logoImage from "@assets/1000244032_1766756092865.png";

export default function Home() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showCatalog, setShowCatalog] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{ backgroundColor: "rgba(88, 28, 135, 0.95)" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading font-bold text-2xl tracking-tighter flex items-center gap-2"
            style={{
              color: "#ffffff",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            <HomeIcon size={20} />
            DRUZHBA
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
              <Link href="/" className="hover:text-white transition-colors">Главная</Link>
              <Link href="/about" className="hover:text-white transition-colors">О нас</Link>
              <Link href="/delivery" className="hover:text-white transition-colors">Доставка и оплата</Link>
              <Link href="/returns" className="hover:text-white transition-colors">Возврат</Link>
            </div>
            <CartDrawer />
          </div>
        </div>
      </nav>

      {/* Header / Hero - ОПТИМИЗИРОВАНО ДЛЯ СКОРОСТИ */}
      <header className="relative min-h-[600px] flex items-center text-white overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Background" 
            className="w-full h-full object-cover"
            // @ts-ignore
            fetchPriority="high" 
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-8">
          <div className="max-w-3xl flex flex-col items-start text-left">
            <div className="mb-8 mt-4 p-1 bg-black rounded-xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-left duration-700">
              <img
                src={logoImage}
                alt="DRUZHBA Logo"
                className="h-32 md:h-48 w-auto object-contain rounded-lg"
                // @ts-ignore
                fetchPriority="high"
                loading="eager"
              />
            </div>

            <span className="inline-block py-2 px-4 rounded-full bg-sky-500 text-white text-xs md:text-sm font-black tracking-widest mb-4 border border-sky-400 shadow-lg shadow-sky-500/20 uppercase">
              МЫ ЗАНИМАЕМСЯ СОБСТВЕННЫМ ПРОИЗВОДСТВОМ
            </span>

            <h1 className="text-6xl md:text-8xl font-bold font-heading mb-6 tracking-tight drop-shadow-2xl">
              DRUZHBA
            </h1>

            <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-xl leading-relaxed drop-shadow-md">
              Высокое качество, доступные цены и быстрое оформление заказов для вашего бизнеса.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-4 w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-[#581c8b] border-0 shadow-xl shadow-black/20 text-lg h-14 px-10 rounded-full transition-all hover:scale-105"
                onClick={() => (window.location.href = "/catalog")}
              >
                <div className="bg-[#581c8b] p-1.5 rounded-full mr-3">
                    <LayoutGrid className="h-5 w-5 text-white" />
                </div>
                Каталог
              </Button>
              <Button
                size="lg"
                className="bg-[#0088cc] hover:bg-[#0077b5] text-white border-0 shadow-xl shadow-blue-900/30 text-lg h-14 px-10 rounded-full transition-all hover:scale-105"
                asChild
              >
                <a href="https://t.me/DRUZHBAA_Bot?start=order" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-3 h-6 w-6" /> Telegram Bot
                </a>
              </Button>
              <Button
                size="lg"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white border-0 shadow-xl shadow-green-900/30 text-lg h-14 px-10 rounded-full transition-all hover:scale-105"
                asChild
              >
                <a href="https://wa.me/996557650131?text=Здравствуйте,%20я%20хочу%20сделать%20заказ" target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-3 h-6 w-6" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Хиты продаж */}
      {products.filter((p) => p.is_bestseller).length > 0 && (
        <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-bold text-gray-800">Хиты продаж</h2>
                  <p className="text-muted-foreground text-sm">Самые популярные товары</p>
                </div>
              </div>
              <Link href="/catalog">
                <Button variant="outline" className="gap-2">Все товары <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.filter((p) => p.is_bestseller).slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Новинки */}
      {products.filter((p) => p.is_new).length > 0 && (
        <section className="py-16 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-bold text-gray-800">Новинки</h2>
                  <p className="text-muted-foreground text-sm">Свежие поступления</p>
                </div>
              </div>
              <Link href="/catalog">
                <Button variant="outline" className="gap-2">Все товары <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.filter((p) => p.is_new).slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Преимущества */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">Качество</h3>
              <p className="text-muted-foreground text-sm">Сертифицированная продукция из лучших материалов</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">Доставка</h3>
              <p className="text-muted-foreground text-sm">Отправка во все регионы в кратчайшие сроки</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">Ассортимент</h3>
              <p className="text-muted-foreground text-sm">Широкий выбор моделей для всей семьи</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading font-bold text-2xl text-white mb-4">DRUZHBA</h3>
              <p className="text-sm leading-relaxed max-w-xs">
                Ваш надежный партнер в мире оптовой обуви. Мы предлагаем лучшие условия для бизнеса и гарантируем качество каждой пары.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Информация</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Главная</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">О нас</Link></li>
                <li><Link href="/delivery" className="hover:text-white transition-colors">Доставка и оплата</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Возврат товара</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Контакты</h4>
              <ul className="space-y-3 text-sm">
                <li>Телефон: +996 557 650 131</li>
                <li>Telegram: @DRUZHBAA_Bot</li>
                <li className="text-gray-400">
                  <span className="block font-semibold text-white mb-1">График работы:</span>
                  Пн – Чт, Сб – Вс: 08:00 – 17:00<br />
                  <span className="text-red-400">Пятница: Выходной</span>
                </li>
                <li>Адрес: Рынок "Дордой", Оберон Форт, 30 проход, 2 контейнер</li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-bold text-white mb-4">QR-код сайта</h4>
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <img
                  src="https://quickchart.io/qr?text=https://druzhbas.live&size=300&margin=2"
                  alt="QR код сайта DRUZHBA"
                  className="w-32 h-32"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
            © 2026 DRUZHBA. Все права защищены.
          </div>
        </div>
      </footer>

      {/* ПЛАВАЮЩАЯ КНОПКА */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-90"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <HomeIcon size={24} />
        </Button>
      </div>
    </div>
  );
      }
                
