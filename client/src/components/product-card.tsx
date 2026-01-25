import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Zap, Ruler, CloudSun, Palette, Box, Flashlight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Функция добавления коробки (напр. +6 пар)
  const handleAddToCart = (count: number, redirect: boolean = false) => {
    addItem(product, count);
    if (redirect) {
      window.location.href = "/cart"; // Быстрый переход к оформлению
    }
  };

  return (
    <Card className="group relative overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white flex flex-col h-full">
      
      {/* ИЗОБРАЖЕНИЕ С ЭФФЕКТАМИ */}
      <div className="relative aspect-[4/4] overflow-hidden bg-gray-100">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* ХИТ / НОВИНКА */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          {product.is_new && (
            <Badge className="bg-[#10b981] text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
              НОВИНКА ✨
            </Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-[#f59e0b] text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
              ХИТ 🔥
            </Badge>
          )}
        </div>

        {/* СЕЗОН (как на макете) */}
        <div className="absolute bottom-5 left-5">
          <Badge className="bg-white/80 backdrop-blur-md text-blue-600 border-none px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-lg">
            <CloudSun size={14} />
            {product.season?.toUpperCase() || "ДЕМИСЕЗОН"}
          </Badge>
        </div>

        {/* КНОПКА БЫСТРЫЙ ЗАКАЗ (Появляется при наведении) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button 
            onClick={() => handleAddToCart(product.pairs_per_box, true)}
            className="bg-slate-900/90 backdrop-blur-md text-white border-none rounded-2xl px-8 py-6 h-auto font-black text-sm uppercase tracking-tighter hover:bg-black transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            БЫСТРЫЙ ЗАКАЗ
          </Button>
        </div>
      </div>

      {/* ТЕКСТОВАЯ ЧАСТЬ */}
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* ХАРАКТЕРИСТИКИ В РЯД */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <Ruler size={14} className="text-blue-500" />
            <span className="text-[11px] font-bold text-slate-600 uppercase">{product.sizes}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <Palette size={14} className="text-purple-500" />
            <span className="text-[11px] font-bold text-slate-600 uppercase">{product.colors || "Цвета в ассорт."}</span>
          </div>
        </div>

        {/* ЦЕНОВОЙ БЛОК */}
        <div className="mt-auto">
          <div className="flex items-end gap-1 mb-1">
            <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
              {product.price}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase pb-0.5">сом / пара</span>
          </div>
          <p className="text-[12px] font-bold text-blue-600 uppercase tracking-wide">
            Итого за короб: {product.price * product.pairs_per_box} сом
          </p>
          <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 italic font-medium">
            {product.description || "Высококачественные материалы, удобная колодка."}
          </p>
        </div>
      </CardContent>

      {/* КНОПКИ УПРАВЛЕНИЯ */}
      <div className="p-6 pt-0 grid grid-cols-2 gap-3">
        <Button 
          onClick={() => handleAddToCart(product.pairs_per_box, true)}
          className="bg-slate-900 hover:bg-black text-white rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest shadow-lg"
        >
          КУПИТЬ КОРОБКУ
        </Button>
        <Button 
          variant="outline"
          onClick={() => handleAddToCart(product.pairs_per_box)}
          className="border-2 border-slate-100 hover:border-blue-600 hover:text-blue-600 rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <ShoppingCart size={16} className="mr-2" />
          + {product.pairs_per_box} ПАР
        </Button>
      </div>
    </Card>
  );
          }
