import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCart();
  const [phone, setPhone] = useState("");

  // Функция для "Быстрого заказа" через WhatsApp
  const handleQuickOrder = () => {
    if (!phone) return alert("Введите номер телефона");
    
    const message = `Новый заказ!\n` + 
      items.map(item => `- ${item.product.name} (${item.quantity} пар)`).join("\n") + 
      `\nИтого: ${total} сом\nТел: ${phone}`;
    
    const whatsappUrl = `https://wa.me/996XXXXXX?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <h1 className="text-xl font-black uppercase mb-4">Корзина пуста</h1>
        <Link href="/"><Button className="rounded-2xl bg-blue-600">В КАТАЛОГ</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-20">
      <div className="flex items-center gap-4 pt-4">
        <Link href="/"><ArrowLeft /></Link>
        <h1 className="text-xl font-black uppercase">Оформление заказа</h1>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <img src={item.product.main_photo} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-bold uppercase">{item.product.name}</p>
                <p className="text-[10px] text-blue-600">{item.quantity} пар х {item.product.price} сом</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.product.id)}>
              <Trash2 size={16} className="text-red-400" />
            </Button>
          </div>
        ))}
      </div>

      <Card className="rounded-[2rem] border-none shadow-lg bg-white p-6">
        <CardContent className="p-0 space-y-4">
          <div className="flex justify-between font-black uppercase text-lg">
            <span>Итого:</span>
            <span>{total} СОМ</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Ваш телефон для связи</label>
            <Input 
              type="tel" 
              placeholder="+996 (___) __-__-__" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 rounded-2xl bg-slate-50 border-none text-lg"
            />
          </div>

          <Button 
            onClick={handleQuickOrder}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase flex gap-2 shadow-xl shadow-green-100"
          >
            <Send size={18} /> БЫСТРЫЙ ЗАКАЗ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
