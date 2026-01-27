import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Список категорий (можно дополнить под твой ассортимент)
const CATEGORIES = ["Все", "Шлепанцы", "Кеды", "Кроссовки", "Сапоги", "Сандалии"];

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState("Все");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Логика фильтрации товаров по категории
  const filteredProducts = products?.filter((product: any) => {
    if (activeCategory === "Все") return true;
    // Сравниваем категорию товара из БД с выбранной кнопкой
    return product.category === activeCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black uppercase text-slate-400 tracking-widest text-[10px]">Загрузка каталога...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Шапка */}
      <div className="p-8 pt-16 text-center">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 mb-2">
          Наш Каталог
        </h1>
        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mb-6"></div>
        
        {/* Кнопки фильтрации */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mb-8 px-4">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-2xl px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105" 
                : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
          Прямые поставки • Лучшие цены
        </p>
      </div>

      {/* Сетка товаров */}
      <div className="max-w-7xl mx-auto px-6">
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
              В категории "{activeCategory}" товаров пока нет
            </p>
            <Button 
              variant="link" 
              onClick={() => setActiveCategory("Все")}
              className="text-blue-600 font-black mt-2 uppercase text-[10px]"
            >
              Вернуться ко всем товарам
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
