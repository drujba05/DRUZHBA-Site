import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Plus, Minus, Flame, Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, removeItem } = useCart();
  const cartItem = items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  // Шаг всегда равен минимальному заказу (например, 6 пар)
  const step = product.min_order_quantity || 6;

  const handleAdd = () => addItem(product, step);
  const handleRemove = () => {
    if (quantity > 0) {
      removeItem(product.id, step);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full border border-slate-100 shadow-sm hover:shadow-md transition-all bg-white rounded-xl group">
      {/* Фото товара */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.main_photo} 
          alt={product.name} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {product.is_bestseller && (
            <Badge className="bg-orange-500 border-none text-[8px] font-bold px-1.5 py-0.5 h-auto">ХИТ</Badge>
          )}
          {product.is_new && (
            <Badge className="bg-green-600 border-none text-[8px] font-bold px-1.5 py-0.5 h-auto">NEW</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-2.5 flex-grow flex flex-col">
        {/* Категория и Название */}
        <div className="mb-1.5">
          <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">
            {product.category}
          </p>
          <h3 className="font-bold text-slate-800 text-[13px] leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Описание */}
        {product.description && (
          <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight mb-2 italic">
            {product.description}
          </p>
        )}

        {/* Характеристики (Размер и Цвет в ряд) */}
        <div className="grid grid-cols-2 gap-1 border-y border-slate-50 py-1.5 my-1">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-400 uppercase font-bold">Размеры</span>
            <span className="text-[10px] font-bold text-slate-700">{product.sizes}</span>
          </div>
          <div className="flex flex-col border-l pl-1.5">
            <span className="text-[8px] text-slate-400 uppercase font-bold">Цвета</span>
            <span className="text-[10px] font-bold text-slate-700 truncate">{product.colors}</span>
          </div>
        </div>

        {/* Минимальный заказ */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[9px] font-medium text-slate-400 uppercase">Мин. заказ:</span>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {step} пар
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-2.5 pt-0 flex flex-col gap-2">
        {/* Цена и упаковка */}
        <div className="flex items-end justify-between w-full">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-black text-slate-900">{product.price}</span>
            <span className="text-[9px] text-slate-500 font-bold">сом/п</span>
          </div>
          <span className="text-[9px] text-slate-400">Короб: {product.pairs_per_box}п.</span>
        </div>

        {/* Кнопка или Счетчик */}
        {quantity === 0 ? (
          <Button 
            className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase rounded-lg shadow-sm" 
            onClick={handleAdd}
          >
            В корзину
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-slate-50 p-0.5 rounded-lg border border-slate-200">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-white" onClick={handleRemove}>
              <Minus className="h-3 w-3" />
            </Button>
            <div className="text-center">
              <span className="text-[11px] font-black text-blue-700 leading-none block">{quantity} п.</span>
              <span className="text-[7px] font-bold text-slate-400 uppercase leading-none">
                {Math.round((quantity / product.pairs_per_box) * 10) / 10} кор.
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-white" onClick={handleAdd}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
              }
