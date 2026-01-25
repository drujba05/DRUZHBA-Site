import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Plus, Minus, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem } = useCart();
  const [activePhoto, setActivePhoto] = useState(product.main_photo);
  
  // Безопасный поиск товара в корзине
  const cartItem = items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const step = product.min_order_quantity || 6;
  const allPhotos = [product.main_photo, ...(product.additional_photos || [])].filter(Boolean);

  return (
    <Card className="overflow-hidden flex flex-col h-full border border-slate-100 shadow-sm bg-white rounded-xl">
      <div className="relative aspect-square bg-slate-50">
        <img src={activePhoto} className="object-cover w-full h-full transition-all duration-300" alt={product.name} />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_bestseller && <Badge className="bg-orange-500 border-none text-[8px] font-bold px-1.5 py-0.5">ХИТ</Badge>}
          {product.is_new && <Badge className="bg-green-600 border-none text-[8px] font-bold px-1.5 py-0.5">NEW</Badge>}
        </div>
        {allPhotos.length > 1 && (
          <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-x-auto no-scrollbar bg-white/50 p-1 rounded-lg">
            {allPhotos.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                onClick={() => setActivePhoto(img)} 
                className={`w-8 h-8 rounded border-2 cursor-pointer object-cover ${activePhoto === img ? "border-blue-600" : "border-white"}`} 
                alt="thumb"
              />
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-2.5 flex-grow space-y-2">
        <div>
          <h3 className="font-bold text-slate-800 text-[13px] leading-tight line-clamp-2 h-8">{product.name}</h3>
          <div className="mt-1 flex items-center gap-1 bg-blue-50/50 p-1 rounded border border-blue-100">
            <Palette className="w-3 h-3 text-blue-600" />
            <span className="text-[9px] font-black text-blue-700 uppercase">Цвета: {product.colors}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[10px] border-y py-1.5">
          <div className="flex flex-col"><span className="text-slate-400 font-bold uppercase">Размеры</span><span className="font-black">{product.sizes}</span></div>
          <div className="flex flex-col border-l pl-2"><span className="text-slate-400 font-bold uppercase">В кор.</span><span className="font-black">{product.pairs_per_box} п.</span></div>
        </div>
      </CardContent>

      <CardFooter className="p-2.5 pt-0 flex flex-col gap-2">
        <div className="flex items-end gap-1">
          <span className="text-lg font-black">{product.price}</span>
          <span className="text-[9px] text-slate-500 font-bold mb-0.5">сом/п</span>
        </div>
        {quantity === 0 ? (
          <Button className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px]" onClick={() => addItem(product, step)}>В КОРЗИНУ</Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-slate-100 p-0.5 rounded-lg border">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(product.id, step)}><Minus size={12}/></Button>
            <span className="text-[11px] font-black text-blue-700">{quantity} п.</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addItem(product, step)}><Plus size={12}/></Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
          }
