import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wind, Users2, RotateCcw, ChevronLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { CartDrawer } from "@/components/cart-drawer";

const SEASONS = ["Лето", "Зима", "Демисезон"];
const GENDERS = ["Мужские", "Женские", "Детские"];

export default function Catalog() {
  const [activeSeason, setActiveSeason] = useState<string | null>(null);
  const [activeGender, setActiveGender] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products?.filter((p: any) => {
    const sMatch = !activeSeason || p.season === activeSeason;
    const gMatch = !activeGender || p.gender === activeGender;
    return sMatch && gMatch;
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">ЗАГРУЗКА...</div>;

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-20 font-sans text-slate-900">
      
      {/* МИНИ-ШАПКА */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            
            {/* Верхний ряд: Назад + Заголовок в рамке + Видимая Корзина */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="h-9 px-2 rounded-xl border border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                    <ChevronLeft size={18} className="text-slate-900" />
                    <span className="ml-1 text-[10px] font-black uppercase tracking-tighter text-slate-900">Назад</span>
                  </Button>
                </Link>
                
                {/* ЗАГОЛОВОК В КРАСИВОЙ РАМКЕ */}
                <div className="px-4 py-1 border-2 border-slate-900 rounded-lg bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <h1 className="text-[12px] font-black uppercase tracking-[0.15em] text-slate-900">Каталог</h1>
                </div>
              </div>

              {/* КОРЗИНА (ЯРКАЯ И ВИДИМАЯ) */}
              <div className="flex items-center justify-center bg-blue-600 rounded-xl p-0.5 shadow-lg shadow-blue-200">
                <CartDrawer />
              </div>
            </div>

            {/* Нижний ряд: Фильтры */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <Wind size={12} className="ml-1 text-blue-500" />
                {SEASONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveSeason(activeSeason === s ? null : s)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                      activeSeason === s ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <Users2 size={12} className="ml-1 text-blue-500" />
                {GENDERS.map(g => (
                  <button
                    key={g}
                    onClick={() => setActiveGender(activeGender === g ? null : g)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                      activeGender === g ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {(activeSeason || activeGender) && (
                <Button variant="ghost" onClick={() => {setActiveSeason(null); setActiveGender(null);}} className="h-8 w-8 p-0 rounded-full hover:bg-red-50">
                  <RotateCcw size={14} className="text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* СЕТКА ТОВАРОВ */}
      <main className="max-w-7xl mx-auto px-2 py-6 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest">Ничего не найдено</div>
        )}
      </main>

      {/* ПЛАВАЮЩАЯ КНОПКА "НА ГЛАВНУЮ" */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-2xl hover:bg-blue-600 transition-all duration-300 active:scale-90"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Home size={24} />
        </Button>
      </div>
    </div>
  );
}
