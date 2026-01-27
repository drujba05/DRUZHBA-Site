import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, ChevronLeft, ChevronRight, X, Maximize2, Minus, Plus, Users, AlignLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [mode, setMode] = useState<"quick" | "cart">("quick");
  
  const allPhotos = [product.main_photo, ...(product.additional_photos || [])].filter(Boolean);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  const [totalPairs, setTotalPairs] = useState(6);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const colorOptions = product.colors ? product.colors.split(/[,/]+/).map((c: string) => c.trim()).filter(Boolean) : [];
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "Стандарт");

  const openModal = (targetMode: "quick" | "cart") => {
    setMode(targetMode);
    setIsOrderOpen(true);
  };

  const handleAction = async () => {
    if (mode === "cart") {
      addItem(product, totalPairs, selectedColor);
      toast({ title: "🛒 ДОБАВЛЕНО", description: `${product.name} в корзине` });
      setIsOrderOpen(false);
    } else {
      if (!name || !phone) {
        toast({ variant: "destructive", title: "Заполните данные" });
        return;
      }
      try {
        const response = await fetch("/api/quick-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, customerName: name, customerPhone: phone, color: selectedColor, quantity: totalPairs }),
        });
        if (response.ok) {
          setIsOrderOpen(false);
          toast({ title: "✅ ЗАКАЗ ОТПРАВЛЕН", description: "Мы скоро свяжемся с вами" });
          setName(""); setPhone("");
        }
      } catch (error) {
        toast({ variant: "destructive", title: "ОШИБКА" });
      }
    }
  };

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-[1.5rem] bg-white flex flex-col h-full font-sans">
      {/* ФОТО СЕКЦИЯ (Компактная 1:1) */}
      <div className="relative aspect-square overflow-hidden m-1 rounded-[1.2rem] bg-slate-100">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
          onClick={() => { setCurrentPhotoIdx(0); setIsGalleryOpen(true); }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_new && <Badge className="bg-green-600 text-[8px] h-4 px-1 shadow-md uppercase">NEW</Badge>}
          <Badge className="bg-blue-600 text-white text-[8px] h-4 px-1 shadow-md uppercase">{product.season}</Badge>
        </div>
        <Button 
          variant="ghost" size="icon" 
          className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-md rounded-full h-8 w-8 shadow-sm"
          onClick={() => { setCurrentPhotoIdx(0); setIsGalleryOpen(true); }}
        >
          <Maximize2 size={14} className="text-slate-900" />
        </Button>
      </div>

      <CardContent className="p-3 flex flex-col flex-grow">
        {/* Название */}
        <h3 className="font-black text-slate-900 text-[12px] uppercase mb-2 line-clamp-1 tracking-tight">
          {product.name}
        </h3>

        {/* Характеристики (Мелкие и аккуратные) */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <Users size={12} className="text-blue-600" />
            <span className="font-bold uppercase">{product.gender}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <Ruler size={12} className="text-blue-600" />
            <span className="font-bold">{product.sizes}</span>
          </div>
          
          {/* БЛОК ОПИСАНИЯ — ТЕПЕРЬ ОНО ТУТ */}
          {product.description && (
            <div className="mt-2 p-2 rounded-xl bg-blue-50/50 border border-blue-100/30">
              <div className="flex items-center gap-1 mb-1 text-blue-700">
                <AlignLeft size={10} />
                <span className="text-[8px] font-black uppercase">Описание:</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 italic">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Цена и статус */}
        <div className="mt-auto pt-2 border-t border-slate-50">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-blue-600 leading-none">{product.price}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">сом/п</span>
          </div>
        </div>

        {/* Кнопки (В один ряд для экономии места) */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button onClick={() => openModal("quick")} className="bg-slate-900 hover:bg-black text-white rounded-xl h-10 text-[9px] font-black uppercase tracking-wider">
            Купить
          </Button>
          <Button variant="outline" onClick={() => openModal("cart")} className="border-slate-200 hover:border-blue-400 text-slate-600 rounded-xl h-10 text-[9px] font-black uppercase">
            <ShoppingCart size={12} />
          </Button>
        </div>
      </CardContent>

      {/* ГАЛЕРЕЯ И МОДАЛКА (ОСТАЮТСЯ КАК БЫЛИ) */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none bg-black/95 flex items-center justify-center">
          <Button variant="ghost" className="absolute top-6 right-6 text-white z-50 rounded-full bg-white/10" onClick={() => setIsGalleryOpen(false)}><X size={32} /></Button>
          {allPhotos.length > 1 && (
            <>
              <Button variant="ghost" className="absolute left-4 text-white z-50 h-20" onClick={() => setCurrentPhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)}><ChevronLeft size={40} /></Button>
              <Button variant="ghost" className="absolute right-4 text-white z-50 h-20" onClick={() => setCurrentPhotoIdx((prev) => (prev + 1) % allPhotos.length)}><ChevronRight size={40} /></Button>
            </>
          )}
          <img src={allPhotos[currentPhotoIdx]} className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg" alt="Gallery"/>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[400px] border-none bg-white font-sans">
          <DialogHeader><DialogTitle className="font-black uppercase text-center text-xl tracking-tighter">{mode === "quick" ? "⚡ БЫСТРЫЙ ЗАКАЗ" : "🛒 В КОРЗИНУ"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            {colorOptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {colorOptions.map((c: string) => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`px-3 py-1 text-[9px] font-black rounded-lg border transition-all ${selectedColor === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400'}`}>{c}</button>
                ))}
              </div>
            )}
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
              <span className="text-[9px] font-black text-slate-400 uppercase mb-2">Количество (по 6 пар)</span>
              <div className="flex items-center gap-6">
                <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-sm" onClick={() => setTotalPairs(Math.max(6, totalPairs - 6))}><Minus size={16}/></Button>
                <span className="text-2xl font-black">{totalPairs}</span>
                <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-sm" onClick={() => setTotalPairs(totalPairs + 6)}><Plus size={16}/></Button>
              </div>
            </div>
            {mode === "quick" && (
              <div className="space-y-2">
                <Input placeholder="Имя" className="h-12 rounded-xl bg-slate-50 border-none px-4 text-sm font-bold" value={name} onChange={e => setName(e.target.value)} />
                <Input placeholder="Телефон" className="h-12 rounded-xl bg-slate-50 border-none px-4 text-sm font-bold" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            )}
            <Button onClick={handleAction} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg">
              {mode === "quick" ? "Подтвердить" : "Добавить"} — {(product.price * totalPairs).toLocaleString()} сом
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
              }
