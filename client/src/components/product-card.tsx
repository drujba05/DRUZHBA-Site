import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, CloudSun, Loader2, Minus, Plus } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  
  // Состояние для количества пар (минимум одна коробка)
  const step = product.pairs_per_box || 12;
  const [totalPairs, setTotalPairs] = useState(step);

  const handleAddToCart = () => {
    addItem(product, totalPairs);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} — ${totalPairs} пар`,
    });
  };

  const handleQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          productSku: product.sku,
          quantity: totalPairs,
          customerName: name,
          customerPhone: phone,
          totalPrice: product.price * totalPairs,
          productPhoto: product.main_photo,
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        setPhone("");
        setName("");
        setTotalPairs(step);
        toast({
          title: "Заказ оформлен!",
          description: "Менеджер свяжется с вами в ближайшее время.",
        });
      } else {
        throw new Error("Ошибка");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заказ.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          {product.is_new && <Badge className="bg-green-500 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">NEW</Badge>}
          {product.is_bestseller && <Badge className="bg-orange-500 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">HIT</Badge>}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-[13px] line-clamp-1 uppercase mb-3 tracking-tight">
          {product.name}
        </h3>

        {/* ПАРАМЕТРЫ */}
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
              <Box size={10} className="text-blue-500" /> {step} пар
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 leading-none">{product.price}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">сом / пара</span>
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 flex flex-col gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">
              КУПИТЬ СЕЙЧАС
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] max-w-[95%] sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-center font-black uppercase">Быстрый заказ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuickOrder} className="space-y-4 pt-2">
              
              {/* ВЫБОР КОЛИЧЕСТВА */}
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Label className="text-[10px] font-black uppercase text-slate-400">Количество пар</Label>
                <div className="flex items-center gap-6">
                  <Button 
                    type="button" variant="outline" size="icon" className="rounded-full h-8 w-8"
                    onClick={() => setTotalPairs(Math.max(step, totalPairs - step))}
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="text-xl font-black text-slate-900">{totalPairs}</span>
                  <Button 
                    type="button" variant="outline" size="icon" className="rounded-full h-8 w-8"
                    onClick={() => setTotalPairs(totalPairs + step)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                  Это {totalPairs / step} кор.
                </p>
              </div>

              <div className="space-y-2">
                <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-12" placeholder="Ваше имя" />
                <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl h-12" placeholder="Ваш телефон" />
              </div>

              <div className="bg-blue-600 p-4 rounded-xl text-white shadow-lg shadow-blue-100">
                <div className="flex justify-between items-center font-black">
                  <span className="text-[10px] uppercase opacity-80">Итого:</span>
                  <span className="text-xl">{product.price * totalPairs} СОМ</span>
                </div>
              </div>

              <Button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 hover:bg-black h-14 rounded-xl font-black uppercase tracking-widest">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "ПОДТВЕРДИТЬ"}
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
