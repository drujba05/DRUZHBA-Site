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

  // Шаг всегда равен минимальному заказу (6 пар)
  const step = product.min_order_quantity || 6;

  const handleAdd = () => addItem(product, step);
  const handleRemove = () => quantity > 0 && removeItem(product.id, step);

  return (
    <Card className="overflow-hidden flex flex-col h-full border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white group rounded-2xl">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={product.main_photo} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_bestseller && <Badge className="bg-orange-500 border-none text-[10px] font-black px-2 py-1 shadow-lg"><Flame className="w-3 h-3 mr-1 fill-current" /> ХИТ</Badge>}
          {product.is_new && <Badge className="bg-green-500 border-none text-[10px] font-black px-2 py-1 shadow-lg"><Sparkles className="w-3 h-3 mr-1 fill-current" /> NEW</Badge>}
        </div>
        <div className="absolute bottom-3 right-3 text-[10px]">
          <Badge className={`border-none font-bold shadow-md ${product.status === "В наличии" ? "bg-green-500 text-white" : "bg-amber-500 text-white"}`}>{product.status}</Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-grow space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base leading-tight">{product.name}</h3>
        
        {product.description && (
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 italic"><Info className="w-3 h-3 inline mr-1 text-blue-500" /> {product.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Размеры</span>
            <span className="font-black text-slate-700">{product.sizes}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Цвета</span>
            <span className="font-black text-slate-700 truncate">{product.colors}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-dashed pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Мин. заказ:</span>
          <span className="text-sm font-black text-blue-600">{step} пар</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-end justify-between w-full">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Цена/пара</span>
            <span className="text-2xl font-black text-slate-900">{product.price} сом</span>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-bold text-slate-400 uppercase block">В коробке</span>
             <span className="font-bold text-slate-600 text-sm">{product.pairs_per_box} п.</span>
          </div>
        </div>

        {quantity === 0 ? (
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-tighter rounded-xl active:scale-95 transition-all" onClick={handleAdd}>
            Добавить {step} пар
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full bg-blue-50 p-1 rounded-xl border border-blue-200">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-600" onClick={handleRemove}><Minus className="h-5 w-5" /></Button>
            <div className="text-center">
              <div className="text-base font-black text-blue-700">{quantity} пар</div>
              <div className="text-[9px] font-bold text-blue-400 uppercase">{Math.round((quantity / product.pairs_per_box) * 10) / 10} кор.</div>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-600" onClick={handleAdd}><Plus className="h-5 w-5" /></Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
                              }
