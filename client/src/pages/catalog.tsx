import { useState } from "react";
import { Link } from "wouter";
import { useProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CartDrawer } from "@/components/cart-drawer";
import { ArrowLeft, MapPin, Phone, Clock, MessageCircle, Star, ShieldCheck } from "lucide-react";

export default function Catalog() {
  const { products } = useProducts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Навигация */}
      <nav className="nav-custom shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all border border-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" /> На главную
          </Link>
          <CartDrawer />
        </div>
      </nav>

      {/* Основной каталог */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center gap-3 mb-8 border-l-4 border-blue-600 pl-4">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
            Каталог продукции
          </h1>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      {/* Секция Контакты и О Компании */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-12 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Описание */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">DRUZHBAA</h2>
              <p className="text-slate-400 leading-relaxed">
                Ваш надежный партнер на рынке «Дордой». Мы предлагаем широкий ассортимент качественной одежды по доступным ценам. Работаем напрямую, гарантируя лучшее предложение.
              </p>
              <div className="flex gap-3">
                <div className="bg-slate-800 p-2 rounded border border-slate-700 flex items-center gap-2">
                  <Star className="text-yellow-500 h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Качество</span>
                </div>
                <div className="bg-slate-800 p-2 rounded border border-slate-700 flex items-center gap-2">
                  <ShieldCheck className="text-green-500 h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Надежность</span>
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="space-y-6">
              <h3 className="text-white font-bold uppercase text-sm tracking-widest border-b border-white/10 pb-2">Контакты</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-400" />
                  </div>
                  <a href="tel:+996557650131" className="hover:text-blue-400 transition-colors">+996 557 650 131</a>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <a href="https://t.me/DRUZHBAA_Bot" target="_blank" className="hover:text-blue-400 transition-colors">Telegram: @DRUZHBAA_Bot</a>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm">Рынок "Дордой", Оберон Форт,<br />30 проход, 2 контейнер</p>
                </div>
              </div>
            </div>

            {/* График работы */}
            <div className="space-y-6">
              <h3 className="text-white font-bold uppercase text-sm tracking-widest border-b border-white/10 pb-2">График работы</h3>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-medium">08:00 – 17:00</span>
                </div>
                <ul className="text-sm space-y-2 text-slate-400">
                  <li className="flex justify-between"><span>Пн – Чт:</span> <span className="text-white">Работаем</span></li>
                  <li className="flex justify-between border-b border-white/5 pb-2"><span>Пятница:</span> <span className="text-red-400 font-bold uppercase text-[10px]">Выходной</span></li>
                  <li className="flex justify-between"><span>Сб – Вс:</span> <span className="text-white">Работаем</span></li>
                </ul>
              </div>
            </div>

          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] opacity-30 uppercase tracking-[0.2em]">
              © 2026 DRUZHBAA • Дордой • Все права защищены
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
