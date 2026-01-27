import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";

// ГЛАВНЫЙ ЭКСПОРТ СТРАНИЦЫ
export default function Catalog() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black uppercase text-slate-400 tracking-widest text-xs">Загрузка каталога...</p>
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
        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mb-4"></div>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
          Прямые поставки • Лучшие цены
        </p>
      </div>

      {/* Сетка товаров */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6 max-w-7xl mx-auto">
        {products?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {products?.length === 0 && (
        <div className="text-center p-20">
          <p className="text-slate-400 font-black uppercase">Товары скоро появятся</p>
        </div>
      )}
    </div>
  );
}
