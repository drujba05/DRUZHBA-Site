import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, CloudSun, Send, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleAddToCart = () => {
    addItem(product, product.pairs_per_box || 12);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} — ${product.pairs_per_box || 12} пар`,
    });
  };

  const handleQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Формируем сообщение для WhatsApp (или просто имитируем отправку)
    const text = `Заказ: ${product.name}\nКол-во: ${product.pairs_per_box} пар\nИмя: ${name}\nТел: ${phone}`;
    const whatsappUrl = `https://wa.me/996XXXXXX?text=${encodeURIComponent(text)}`;
    
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
    toast({ title: "Заявка отправлена!", description: "Мы свяжемся с вами в ближайшее время." });
  };

  return (
    <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] bg-white flex flex-col h-full">
      
      {/* ФОТО */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_new && <Badge className="bg-green-500 text-[8px] px-2 py-0.5 rounded-lg text-white font-black">NEW</Badge>}
          {product.is_bestseller && <Badge className="bg-orange-500 text-[8px] px-2 py-0.5 rounded-lg text-white font-black">HIT</Badge>}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-[13px] line-clamp-1 uppercase mb-3 tracking-tight">
          {product.name}
        </h3>

        {/* ХАРАКТЕРИСТИКИ */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">Размер:</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
              <Ruler size={10} className="text-blue-500" /> {product.sizes}
            </div>
          </div>
          <div className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">В коробе:</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
              <Box size={10} className="text-blue-500" /> {product.pairs_per_box || 12} пар
            </div>
          </div>
        </div>

        {/* ЦЕНА */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 leading-none">{product.price}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">сом / пара</span>
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 flex flex-col gap-2">
        {/* БЫСТРЫЙ ЗАКАЗ (МОДАЛКА) */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">
              КУПИТЬ СЕЙЧАС
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] max-w-[90%] sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-center font-black uppercase">Быстрый заказ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuickOrder} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Ваше имя</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" placeholder="Иван" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Телефон</Label>
                <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" placeholder="+996" />
              </div>
              <Button type="submit" className="w-full bg-green-600 h-12 rounded-xl font-black uppercase flex gap-2">
                <Send size={16} /> Отправить в WhatsApp
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          onClick={handleAddToCart}
          className="w-full border-slate-100 text-slate-500 rounded-xl h-10 text-[10px] font-bold uppercase"
        >
          <ShoppingCart size={14} className="mr-2" /> В корзину
        </Button>
      </div>
    </Card>
  );
            }
