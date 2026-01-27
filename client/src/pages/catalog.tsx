import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wind, Users2, RotateCcw } from "lucide-react";

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">ЗАГРУЗКА...</div>;

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-10 font-sans text-slate-900">
      
      {/* МИНИ-ШАПКА (КОМПАКТНАЯ) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3"> {/* Уменьшен отступ с py-6 до py-3 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black uppercase tracking-tighter">Каталог</h1>
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {filteredProducts?.length || 0}
              </span>
            </div>

            {/* Компактные фильтры */}
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
                <Button variant="ghost" onClick={() => {setActiveSeason(null); setActiveGender(null);}} className="h-8 w-8 p-0 rounded-full">
                  <RotateCcw size={14} className="text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* СЕТКА ТОВАРОВ (ИСПРАВЛЕНА: 2 В РЯД НА МОБИЛКАХ) */}
      <main className="max-w-7xl mx-auto px-2 py-6 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-20 font-black text-slate-300 uppercase">Ничего не найдено</div>
        )}
      </main>
    </div>
  );
}
