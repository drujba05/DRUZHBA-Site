import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, CloudSun, Loader2, Minus, Plus, Palette, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"quick" | "cart">("quick");
  
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  
  // Обработка цветов
  const colorOptions = product.colors 
    ? product.colors.split(/[,/]+/).map(c => c.trim()).filter(Boolean) 
    : [];
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "Стандарт");

  // ЛОГИКА: Минимум 6 пар, шаг +6 пар
  const [totalPairs, setTotalPairs] = useState(6);

  const openModal = (targetMode: "quick" | "cart") => {
    setMode(targetMode);
    setIsOpen(true);
  };

  const handleAddToCart = () => {
    addItem(product, totalPairs, selectedColor);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} (${selectedColor}) — ${totalPairs} пар`,
    });
    setIsOpen(false);
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
          color: selectedColor,
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
      
      {/* ФОТО ТОВАРА */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_new && (
            <Badge className="bg-green-500 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">NEW</Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-orange-500 text-[8px] px-2 py-0.5 rounded-lg border-none text-white font-black">HIT</Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-none px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-sm">
            <CloudSun size={10} className="text-blue-500" />
            {(product.season || "ДЕМИСЕЗОН").toUpperCase()}
          </Badge>
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
            <div className="flex items-center gap-1">
              <Ruler size={10} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-700">{product.sizes}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">В коробе:</span>
            <div className="flex items-center gap-1">
              <Box size={10} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-700">{product.pairs_per_box || 12} пар</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 leading-none">
              {product.price}
            </span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">сом / пара</span>
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 flex flex-col gap-2">
        <Button 
          onClick={() => openModal("quick")}
          className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          КУПИТЬ СЕЙЧАС
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => openModal("cart")}
          className="w-full border-slate-100 hover:border-blue-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl h-10 text-[10px] font-bold uppercase transition-colors"
        >
          <ShoppingCart size={14} className="mr-2" />
          В корзину
        </Button>

        {/* МОДАЛЬНОЕ ОКНО */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="rounded-[2.5rem] max-w-[95%] sm:max-w-[420px] p-6 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-center font-black uppercase text-xl tracking-tighter">
                {mode === "quick" ? "Быстрый заказ" : "Параметры"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {/* ВЫБОР ЦВЕТА */}
              {colorOptions.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Цвет модели</Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="rounded-2xl h-12 border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Palette size={14} className="text-blue-500" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      {colorOptions.map((color) => (
                        <SelectItem key={color} value={color} className="font-bold uppercase text-xs">
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* СЧЕТЧИК ПАР С ШАГОМ 6 */}
              <div className="flex flex-col items-center gap-2 p-4 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
                <Label className="text-[10px] font-black uppercase text-blue-400">Количество пар</Label>
                <div className="flex items-center gap-8">
                  <Button 
                    type="button" variant="ghost" size="icon" 
                    className="h-10 w-10 rounded-full bg-white shadow-sm hover:bg-white active:scale-90 transition-all"
                    onClick={() => setTotalPairs(Math.max(6, totalPairs - 6))}
                  >
                    <Minus size={18} className="text-blue-600" />
                  </Button>
                  <div className="text-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">{totalPairs}</span>
                    <p className="text-[9px] font-bold text-blue-500 uppercase">пары</p>
                  </div>
                  <Button 
                    type="button" variant="ghost" size="icon" 
                    className="h-10 w-10 rounded-full bg-white shadow-sm hover:bg-white active:scale-90 transition-all"
                    onClick={() => setTotalPairs(totalPairs + 6)}
                  >
                    <Plus size={18} className="text-blue-600" />
                  </Button>
                </div>
              </div>

              {/* ФОРМА БЫСТРОГО ЗАКАЗА */}
              {mode === "quick" ? (
                <form onSubmit={handleQuickOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl h-12 border-slate-100 bg-slate-50/50 px-4" placeholder="Ваше имя" />
                    <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl h-12 border-slate-100 bg-slate-50/50 px-4" placeholder="+996..." />
                  </div>
                  <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-xl">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">К оплате:</span>
                      <span className="text-2xl font-black">{(product.price * totalPairs).toLocaleString()} сом</span>
                    </div>
                    <Button 
                      disabled={isSubmitting} 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-500 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "ПОДТВЕРДИТЬ ЗАКАЗ"}
                    </Button>
                  </div>
                </form>
              ) : (
                /* КНОПКА КОРЗИНЫ */
                <div className="bg-blue-600 p-5 rounded-[2rem] text-white shadow-xl">
                  <div className="flex justify-between items-center mb-3 px-1 font-black">
                    <span className="text-[10px] uppercase opacity-80">Итого:</span>
                    <span className="text-2xl">{(product.price * totalPairs).toLocaleString()} сом</span>
                  </div>
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-white text-blue-600 hover:bg-white/90 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all"
                  >
                    <Check size={18} className="mr-2" /> В КОРЗИНУ
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
