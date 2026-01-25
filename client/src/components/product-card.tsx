import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Plus, Minus, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem } = useCart();
  
  // Защита: если продукта нет, ничего не рисуем
  if (!product) return null;

  const [activePhoto, setActivePhoto] = useState(product.main_photo || "");
  
  // Используем опциональную цепочку ?. чтобы не было ошибки если items пустой
  const cartItem = items?.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const step = product.min_order_quantity || 6;

  return (
    <Card className="overflow-hidden flex flex-col h-full border border-slate-100 shadow-sm bg-white rounded-xl">
      <div className="relative aspect-square bg-slate-50">
        <img 
          src={activePhoto} 
          className="object-cover w-full h-full" 
          alt={product.name || "Товар"} 
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_bestseller && (
            <Badge className="bg-orange-500 text-[8px] px-1.5 py-0.5 border-none">ХИТ</Badge>
          )}
          {product.is_new && (
            <Badge className="bg-green-600 text-[8px] px-1.5 py-0.5 border-none">NEW</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-2.5 flex-grow">
        <h3 className="font-bold text-slate-800 text-[13px] leading-tight line-clamp-2 h-8">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-1 bg-blue-50/50 p-1 rounded border border-blue-100">
          <Palette className="w-3 h-3 text-blue-600" />
          <span className="text-[9px] font-black text-blue-700 uppercase">
            Цвета: {product.colors || "—"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-2.5 pt-0 flex flex-col gap-2">
        <div className="flex items-end gap-1">
          <span className="text-lg font-black text-blue-800">{product.price} сом</span>
        </div>
        
        {quantity === 0 ? (
          <Button 
            className="w-full h-8 bg-blue-600 text-white font-bold text-[10px]" 
            onClick={() => addItem(product, step)}
          >
            В КОРЗИНУ
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-slate-100 p-0.5 rounded-lg border">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => removeItem(product.id, step)}
            >
              <Minus size={12}/>
            </Button>
            <span className="text-[11px] font-black text-blue-700">{quantity} п.</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => addItem(product, step)}
            >
              <Plus size={12}/>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
          
