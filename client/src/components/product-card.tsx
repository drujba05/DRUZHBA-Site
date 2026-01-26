import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, CloudSun, Loader2, Minus, Plus, Palette, Check, Snowflake, Sun, ThermometerSun } from "lucide-react";
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
  
  // Обработка цветов (из строки "Красный, Синий" делаем список)
  const colorOptions = product.colors 
    ? product.colors.split(/[,/]+/).map(c => c.trim()).filter(Boolean) 
    : [];
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "Стандарт");

  // Минимум 6 пар
  const [totalPairs, setTotalPairs] = useState(product.min_order_quantity || 6);

  // Иконка сезона
  const getSeasonIcon = (season?: string) => {
    if (season === "Зима") return <Snowflake size={10} className="text-blue-400" />;
    if (season === "Лето") return <Sun size={10} className="text-orange-400" />;
    return <ThermometerSun size={10} className="text-green-500" />; // Для Демисезона и остальных
  };

  const openModal = (targetMode: "quick" | "cart") => {
    setMode(targetMode);
    setIsOpen(true);
  };

  const handleAddToCart = () => {
    addItem(product, totalPairs, selectedColor);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} — ${totalPairs} пар`,
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
        toast({ title: "Заказ оформлен!", description: "Менеджер свяжется с вами." });
      } else { throw new Error(); }
    } catch (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] bg-white flex flex-col h-full">
      
      {/* ФОТО ТОВАРА */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          {product.is_new && (
            <Badge className="bg-green-500 text-[9px] px-2 py-0.5 rounded-lg border-none text-white font-black shadow-lg uppercase">NEW</Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-orange-500 text-[9px] px-2 py-0.5 rounded-lg border-none text-white font-black shadow-lg uppercase">HIT</Badge>
          )}
        </div>

        <div className="absolute bottom-4 left-4">
          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-md uppercase tracking-wider">
            {getSeasonIcon(product.season)}
            {product.season || "Все сезоны"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="font-black text-slate-800 text-[14px] line-clamp-2 uppercase mb-4 tracking-tight leading-tight h-8">
          {product.name}
        </h3>

        {/* ПАРАМЕТРЫ ТОВАРА */}
        <div className="space-y-2 mb-4">
          {/* ЦВЕТА ТЕПЕРЬ ТУТ */}
          {colorOptions.length > 0 && (
            <div className="flex flex-col items-start p-2.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Доступные цвета:</span>
              <div className="flex items-center gap-2">
                <Palette size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-700 leading-none">{product.colors}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-start p-2.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Размеры:</span>
              <div className="flex items-center gap-2">
                <Ruler size={12} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-800 leading-none">{product.sizes}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-start p-2.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">В коробе:</span>
              <div className="flex items-center gap-2">
                <Box size={12} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-800 leading-none">{product.pairs_per_box || "12"} пар</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-slate-50">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 leading-none">
              {product.price}
            </span>
            <span className="text-[11px] font-black text-blue-400 uppercase tracking-tighter">сом / пара</span>
          </div>
        </div>
      </CardContent>

      <div className="p-5 pt-0 flex flex-col gap-2">
        <Button 
          onClick={() => openModal("quick")}
          className="w-full bg-slate-900 hover:bg-black text-white rounded-[1.2rem] h-12 text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          КУПИТЬ СЕЙЧАС
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => openModal("cart")}
          className="w-full border-slate-100 hover:border-blue-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-[1.2rem] h-12 text-[10px] font-bold uppercase transition-all"
        >
          <ShoppingCart size={16} className="mr-2" />
          В корзину
        </Button>

        {/* МОДАЛЬНОЕ ОКНО БЕЗ ИЗМЕНЕНИЙ (ТОЛЬКО СКРУГЛЕНИЯ) */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="rounded-[3rem] max-w-[95%] sm:max-w-[420px] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-center font-black uppercase text-2xl tracking-tighter italic">
                {mode === "quick" ? "Быстрый заказ" : "Выбор параметров"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-5 pt-4">
              {colorOptions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Выберите цвет</Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="rounded-[1.5rem] h-14 border-slate-100 bg-slate-50/50 shadow-inner">
                      <div className="flex items-center gap-3 font-black text-sm uppercase">
                        <Palette size={16} className="text-blue-500" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-[1.5rem] border-none shadow-2xl">
                      {colorOptions.map((color) => (
                        <SelectItem key={color} value={color} className="font-bold uppercase text-xs py-3">
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col items-center gap-3 p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 shadow-inner">
                <Label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Количество (шаг 6)</Label>
                <div className="flex items-center gap-10">
                  <Button 
                    type="button" variant="ghost" size="icon" 
                    className="h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg active:scale-90 transition-all"
                    onClick={() => setTotalPairs(Math.max(6, totalPairs - 6))}
                  >
                    <Minus size={20} className="text-blue-600" />
                  </Button>
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900 leading-none">{totalPairs}</span>
                    <p className="text-[10px] font-black text-blue-500 uppercase mt-1">пар</p>
                  </div>
                  <Button 
                    type="button" variant="ghost" size="icon" 
                    className="h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg active:scale-90 transition-all"
                    onClick={() => setTotalPairs(totalPairs + 6)}
                  >
                    <Plus size={20} className="text-blue-600" />
                  </Button>
                </div>
              </div>

              {mode === "quick" ? (
                <form onSubmit={handleQuickOrder} className="space-y-3">
                  <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold" placeholder="Имя" />
                  <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold" placeholder="Телефон" />
                  <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase opacity-60">Итого:</span>
                      <span className="text-3xl font-black italic">{(product.price * totalPairs).toLocaleString()} сом</span>
                    </div>
                    <Button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-lg active:scale-95 transition-all">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "ОФОРМИТЬ"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-2xl">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-[10px] font-black uppercase opacity-80 tracking-widest">Сумма:</span>
                    <span className="text-3xl font-black italic">{(product.price * totalPairs).toLocaleString()} сом</span>
                  </div>
                  <Button onClick={handleAddToCart} className="w-full bg-white text-blue-600 hover:bg-slate-50 h-14 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg active:scale-95 transition-all">
                    <Check size={20} className="mr-2 shadow-sm" /> В КОРЗИНУ
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
