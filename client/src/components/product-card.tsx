import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, ShoppingBag, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function Cart() {
  const { items, addItem, removeItem, clearCart, updateItemColor } = useCart();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const missingColors = items.some(item => !item.selectedColor || item.selectedColor.trim() === "");
    if (missingColors) {
      toast({ title: "Укажите цвета", description: "Напишите цвета для всех товаров", variant: "destructive" });
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      toast({ title: "Заказ готов!" });
      setIsSending(false);
      clearCart();
    }, 1000);
  };

  if (items.length === 0) return <div className="p-8 text-center text-slate-400 font-bold">КОРЗИНА ПУСТА</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex justify-between items-center font-black uppercase">
        <span>Корзина ({items.length})</span>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 text-[10px]">Удалить всё</Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col gap-3 pb-4 border-b">
              <div className="flex gap-3">
                <img src={item.main_photo} className="w-16 h-16 object-cover rounded shadow-sm" />
                <div className="flex-grow">
                  <h4 className="font-bold text-[12px] leading-tight">{item.name}</h4>
                  <p className="text-blue-600 font-black text-xs">{item.price} сом/п</p>
                  <Input 
                    placeholder="Какой цвет и размер?" 
                    className="h-8 text-[11px] mt-2 bg-slate-50" 
                    value={item.selectedColor || ""} 
                    onChange={(e) => updateItemColor(item.productId, e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeItem(item.productId, item.min_order_quantity)}><Minus size={14} /></Button>
                  <span className="font-bold text-sm">{item.quantity} п.</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addItem(item, item.min_order_quantity)}><Plus size={14} /></Button>
                </div>
                <span className="font-black text-blue-700">{item.price * item.quantity} сом</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-slate-50">
        <div className="flex justify-between mb-4 font-black"><span>ИТОГО:</span><span>{total} сом</span></div>
        <Button className="w-full h-12 bg-blue-600 font-black uppercase text-white shadow-lg shadow-blue-200" onClick={handleCheckout} disabled={isSending}>
          {isSending ? "Отправка..." : "Оформить заказ"}
        </Button>
      </div>
    </div>
  );
    }
