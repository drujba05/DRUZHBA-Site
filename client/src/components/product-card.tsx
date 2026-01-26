import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, Palette, ChevronLeft, ChevronRight, X, Maximize2, Minus, Plus, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ProductCard({ product }: { product: Product }) {
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

  const colorOptions = product.colors ? product.colors.split(/[,/]+/).map(c => c.trim()).filter(Boolean) : [];
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "Стандарт");

  const openModal = (targetMode: "quick" | "cart") => {
    setMode(targetMode);
    setIsOrderOpen(true);
  };

  const handleAction = async () => {
    if (mode === "cart") {
      addItem(product, totalPairs, selectedColor);
      toast({ 
        className: "bg-white border-2 border-blue-600 rounded-2xl shadow-2xl",
        title: "🛒 КОРЗИНА ОБНОВЛЕНА", 
        description: `${product.name} — ${totalPairs} пар добавлено` 
      });
      setIsOrderOpen(false);
    } else {
      try {
        const response = await fetch("/api/quick-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            customerName: name,
            customerPhone: phone,
            color: selectedColor,
            quantity: totalPairs
          }),
        });

        if (response.ok) {
          // ЗАКРЫВАЕМ МОДАЛКУ ПЕРЕД УВЕДОМЛЕНИЕМ
          setIsOrderOpen(false);
          
          // ЭФФЕКТНОЕ УВЕДОМЛЕНИЕ (НЕ ПРОЗРАЧНОЕ)
          toast({ 
            className: "bg-slate-900 border-none text-white rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4",
            duration: 5000,
            title: "✅ ЗАКАЗ ОТПРАВЛЕН!", 
            description: (
              <div className="text-slate-300">
                <p className="font-bold text-white uppercase text-[10px] mb-1">Товар: {product.name}</p>
                Мы свяжемся с вами в Telegram/WhatsApp
              </div>
            )
          });
          setName("");
          setPhone("");
        } else {
          throw new Error();
        }
      } catch (error) {
        toast({ 
          variant: "destructive",
          className: "rounded-2xl shadow-xl",
          title: "ОШИБКА ОТПРАВКИ", 
          description: "Проверьте интернет и попробуйте снова." 
        });
      }
    }
  };

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-[#FDFDFD] flex flex-col h-full font-sans">
      
      {/* ФОТО СЕКЦИЯ */}
      <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[2rem] bg-slate-100">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
          onClick={() => { setCurrentPhotoIdx(0); setIsGalleryOpen(true); }}
        />
        <div className="absolute top-4 left-4 flex gap-1.5">
          {product.is_new && <Badge className="bg-green-500 border-none font-black text-[9px] px-2 py-1 shadow-lg uppercase tracking-tighter">NEW</Badge>}
          {product.is_bestseller && <Badge className="bg-orange-500 border-none font-black text-[9px] px-2 py-1 shadow-lg uppercase tracking-tighter">HIT</Badge>}
        </div>
        <Button 
          variant="ghost" size="icon" 
          className="absolute bottom-4 right-4 bg-white/60 backdrop-blur-md rounded-full shadow-lg"
          onClick={() => { setCurrentPhotoIdx(0); setIsGalleryOpen(true); }}
        >
          <Maximize2 size={18} className="text-slate-800" />
        </Button>
      </div>

      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="font-black text-slate-900 text-[14px] uppercase mb-4 leading-tight min-h-[35px] tracking-tight">{product.name}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Palette size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Цвета:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase line-clamp-1">{product.colors || "Ассортимент"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Ruler size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Размеры:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{product.sizes}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Box size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">В коробе:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{product.pairs_per_box || "12"} пар</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-blue-600 leading-none">{product.price}</span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">сом / пара</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => openModal("quick")}
            className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-12 text-[10px] font-black uppercase tracking-[0.15em] transition-all"
          >
            Купить сейчас
          </Button>
          <Button 
            variant="outline"
            onClick={() => openModal("cart")}
            className="w-full border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-2xl h-12 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <ShoppingCart size={14} className="mr-2" />
            В корзину
          </Button>
        </div>
      </CardContent>

      {/* ГАЛЕРЕЯ */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none bg-black/95 backdrop-blur-xl flex items-center justify-center shadow-none">
          <Button variant="ghost" className="absolute top-6 right-6 text-white z-50 rounded-full hover:bg-white/10" onClick={() => setIsGalleryOpen(false)}><X size={32} /></Button>
          {allPhotos.length > 1 && (
            <>
              <Button variant="ghost" className="absolute left-4 text-white z-50 h-20 hover:bg-transparent" onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length); }}><ChevronLeft size={40} /></Button>
              <Button variant="ghost" className="absolute right-4 text-white z-50 h-20 hover:bg-transparent" onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((prev) => (prev + 1) % allPhotos.length); }}><ChevronRight size={40} /></Button>
            </>
          )}
          <img src={allPhotos[currentPhotoIdx]} className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" alt="Gallery"/>
        </DialogContent>
      </Dialog>

      {/* МОДАЛКА ЗАКАЗА */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="rounded-[3rem] p-8 max-w-[420px] border-none shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="font-black uppercase text-center text-2xl tracking-tighter text-slate-900">
              {mode === "quick" ? "⚡ БЫСТРЫЙ ЗАКАЗ" : "🛒 В КОРЗИНУ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            
            {colorOptions.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Выберите цвет:</span>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(c => (
                    <button 
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-[10px] font-bold rounded-2xl border transition-all duration-300 ${selectedColor === c ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-blue-200'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50">
              <span className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-[0.2em]">Количество (шаг 6)</span>
              <div className="flex items-center gap-10">
                <Button variant="ghost" className="h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all" onClick={() => setTotalPairs(Math.max(6, totalPairs - 6))}><Minus size={20} className="text-blue-600"/></Button>
                <span className="text-4xl font-black text-slate-900">{totalPairs}</span>
                <Button variant="ghost" className="h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all" onClick={() => setTotalPairs(totalPairs + 6)}><Plus size={20} className="text-blue-600"/></Button>
              </div>
              <span className="mt-4 text-[11px] font-bold text-blue-800/60 uppercase">Итого: {totalPairs} пар</span>
            </div>

            {mode === "quick" && (
              <div className="space-y-3">
                <Input placeholder="Ваше имя" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all" value={name} onChange={e => setName(e.target.value)} />
                <Input placeholder="Номер телефона" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            )}
            
            <Button onClick={handleAction} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
              {mode === "quick" ? "Подтвердить заказ" : "В корзину"} — {(product.price * totalPairs).toLocaleString()} сом
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
      }
      
