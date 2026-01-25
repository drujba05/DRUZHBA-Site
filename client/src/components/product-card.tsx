import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, CloudSun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter"; // Для правильного перехода

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [, setLocation] = useLocation();

  // ИСПРАВЛЕННАЯ ЛОГИКА: Ждем добавления и переходим
  const handleAddAction = (shouldRedirect: boolean = false) => {
    // 1. Добавляем товар в корзину
    addItem(product, product.pairs_per_box);
    
    if (shouldRedirect) {
      // 2. Небольшая задержка, чтобы данные успели обновиться в памяти
      setTimeout(() => {
        setLocation("/cart");
      }, 100);
    }
  };

  return (
    <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] bg-white flex flex-col h-full">
      
      {/* ФОТО ТОВАРА */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* МЕТКИ ТОВАРА */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_new && (
            <Badge className="bg-green-500 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">NEW</Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-orange-500 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">HIT</Badge>
          )}
        </div>

        {/* СЕЗОННОСТЬ */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-none px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-sm">
            <CloudSun size={10} className="text-blue-500" />
            {(product.season || "ДЕМИСЕЗОН").toUpperCase()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        {/* НАЗВАНИЕ */}
        <h3 className="font-bold text-slate-800 text-[13px] line-clamp-1 uppercase mb-3 tracking-tight">
          {product.name}
        </h3>

        {/* ПАРАМЕТРЫ */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">Размер:</span>
            <div className="flex items-center gap-1">
              <Ruler size={10} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-700">{product.sizes}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">В коробе:</span>
            <div className="flex items-center gap-1">
              <Box size={10} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-700">{product.pairs_per_box} пар</span>
            </div>
          </div>
        </div>

        {/* ЦЕНЫ */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 leading-none tracking-tighter">
              {product.price}
