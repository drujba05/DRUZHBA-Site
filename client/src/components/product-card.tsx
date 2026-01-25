import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, CloudSun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Добавление сразу одной коробки (например, +6 пар)
  const handleAddAction = (shouldRedirect: boolean = false) => {
    // Используем количество пар в коробке из админки
    addItem(product, product.pairs_per_box);
    if (shouldRedirect) {
      window.location.href = "/cart";
    }
  };

  return (
    <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] bg-white flex flex-col h-full">
      
      {/* КОМПАКТНОЕ ФОТО */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* МИНИ-БЕЙДЖИ (NEW / HIT) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_new && (
            <Badge className="bg-green-500/90 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">
              NEW
            </Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-orange-500/90 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">
              HIT
            </Badge>
          )}
        </div>

        {/* СЕЗОННОСТЬ (МЕЛКО) */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/80 backdrop-blur-sm text-slate-900 border-none px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1">
            <CloudSun size={10} className="text-blue-500" />
            {product.season?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* КОНТЕНТНАЯ ЧАСТЬ */}
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-[13px] line-clamp-1 uppercase mb-2 tracking-tight">
          {product.name}
        </h3>

        {/* ПАРАМЕТРЫ (РАЗМЕРЫ И КОЛ-ВО) */}
        <div className="flex items-center gap-3 mb-4 text-[10px] text-slate-400 font-bold uppercase">
          <span className="flex items-center gap-1"><Ruler size={11} className="text-slate-300"/> {product.sizes}</span>
          <span className="flex items-center gap-1"><Box size={11} className="text-slate-300"/> {product.pairs_per_box} пар</span>
        </div>

        {/* ЦЕНЫ: ПСИХОЛОГИЧЕСКИЙ АКЦЕНТ */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 leading-none tracking-tighter">
              {product.price}
            </span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">сом / пара</span>
          </div>
          
          {/* Цена за коробку — маленькая и серая, чтобы не пугать */}
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Коробка ({product.pairs_per_box} пар): <span className="text-slate-500 font-bold">{product.price * product.pairs_per_box} сом</span>
          </p>
        </div>
      </CardContent>

      {/* КНОПКИ: МАКСИМАЛЬНО КОМПАКТНЫЕ */}
      <div className="p-4 pt-0 flex flex-col gap-2">
        <Button 
          onClick={() => handleAddAction(true)}
          className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-10 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          КУПИТЬ СЕЙЧАС
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleAddAction(false)}
          className="w-full border-slate-100 hover:border-blue-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl h-10 text-[10px] font-bold uppercase transition-all"
        >
          <ShoppingCart size={14} className="mr-2" />
          В корзину (+{product.pairs_per_box})
        </Button>
      </div>
    </Card>
  );
      }
