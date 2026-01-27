import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wind, Users2, RotateCcw, LayoutGrid, SearchX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Названия должны совпадать с данными в твоей базе/админке
const SEASONS = ["Лето", "Зима", "Демисезон"];
const GENDERS = ["Мужские", "Женские", "Детские"];

export default function Catalog() {
  const [activeSeason, setActiveSeason] = useState<string | null>(null);
  const [activeGender, setActiveGender] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Логика фильтрации
  const filteredProducts = products?.filter((p: any) => {
    const sMatch = !activeSeason || p.season === activeSeason;
    const gMatch = !activeGender || p.gender === activeGender;
    return sMatch && gMatch;
  });

  const resetFilters = () => {
    setActiveSeason(null);
    setActiveGender(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-black uppercase text-slate-400 tracking-widest text-[10px]">Загрузка коллекции...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-20 font-sans">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ С ФИЛЬТРАМИ */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-6">
            
            {/* Заголовок и Счетчик */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                  Каталог
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="h-1 w-8 bg-blue-600 rounded-full" />
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Оптовый склад</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white px-5 py-2 rounded-2xl shadow-xl hidden sm:block">
                <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1 text-center tracking-widest">Найдено</p>
                <p className="text-xl font-black leading-none text-center">{filteredProducts?.length || 0}</p>
              </div>
            </div>

            {/* Блок управления фильтрами */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Сезоны */}
              <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/50">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Wind size={14} className="text-blue-600" />
                </div>
                <div className="flex gap-1 pr-2">
                  {SEASONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSeason(activeSeason === s ? null : s)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                        activeSeason === s 
                        ? "bg-blue-600 text-white shadow-lg scale-105" 
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Гендер */}
              <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/50">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Users2 size={14} className="text-blue-600" />
                </div>
                <div className="flex gap-1 pr-2">
                  {GENDERS.map(g => (
                    <button
                      key={g}
                      onClick={() => setActiveGender(activeGender === g ? null : g)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                        activeGender === g 
                        ? "bg-slate-900 text-white shadow-lg scale-105" 
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Кнопка сброса */}
              {(activeSeason || activeGender) && (
                <Button 
                  onClick={resetFilters}
                  variant="ghost"
                  className="h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <RotateCcw size={20} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* СЕТКА ТОВАРОВ */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {filteredProducts && filteredProducts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 text-center"
            >
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 max-w-sm">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Ничего не нашли</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Попробуйте выбрать другой сезон или категорию</p>
                <Button onClick={resetFilters} className="w-full bg-blue-600 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                  Показать всё
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
      }
