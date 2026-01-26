import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, Palette, ChevronLeft, ChevronRight, X, Maximize2, Minus, Plus, Check } from "lucide-react";
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

  const handleAction = () => {
    if (mode === "cart") {
      addItem(product, totalPairs, selectedColor);
      toast({ title: "Добавлено в корзину", description: `${product.name} — ${totalPairs} пар` });
      setIsOrderOpen(false);
    } else {
      // Здесь логика быстрого заказа через API
      toast({ title: "Заказ оформлен" });
      setIsOrderOpen(false);
    }
  };

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-[#FDFDFD] flex flex-col h-full">
      
      {/* ФОТО */}
      <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[2rem] bg-slate-100">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
          onClick={() => { setCurrentPhotoIdx(0); setIsGalleryOpen(true); }}
        />
        <div className="absolute top-4 left-4 flex gap-1.5">
          {product.is_new && <Badge className="bg-green-500 border-none font-black text-[9px] px-2 py-1 shadow-lg uppercase">NEW</Badge>}
          {product.is_bestseller && <Badge className="bg-orange-500 border-none font-black text-[9px] px-2 py-1 shadow-lg uppercase">HIT</Badge>}
        </div>
        <Button 
          variant="ghost" size="icon" 
          className="absolute bottom-4 right-4 bg-white/60 backdrop-blur-md rounded-full"
          onClick={() => { setCurrentPhotoIdx(0); setIsGalleryOpen(true); }}
        >
          <Maximize2 size={18} className="text-slate-800" />
        </Button>
      </div>

      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="font-black text-slate-900 text-[14px] uppercase mb-4 leading-tight min-h-[35px]">{product.name}</h3>

        {/* ПАРАМЕТРЫ */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Palette size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Цвета:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase line-clamp-1">{product.colors || "Ассортимент"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Ruler size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Размеры:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{product.sizes}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Box size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">В коробе:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{product.pairs_per_box || "12"} пар</span>
            </div>
          </div>
        </div>

        {/* ЦЕНА - компактно снизу */}
        <div className="mt-auto pt-2 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 leading-none">{product.price}</span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">сом / пара</span>
          </div>
        </div>

        {/* КНОПКИ ДРУГ ПОД ДРУГОМ */}
        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => openModal("quick")}
            className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
          >
            Купить сейчас
          </Button>
          <Button 
            variant="outline"
            onClick={() => openModal("cart")}
            className="w-full border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl h-11 text-[10px] font-bold uppercase"
          >
            <ShoppingCart size={14} className="mr-2" />
            В корзину
          </Button>
        </div>
      </CardContent>

      {/* ГАЛЕРЕЯ */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none bg-black flex items-center justify-center shadow-none">
          <Button variant="ghost" className="absolute top-6 right-6 text-white z-50" onClick={() => setIsGalleryOpen(false)}><X size={32} /></Button>
          {allPhotos.length > 1 && (
            <>
              <Button variant="ghost" className="absolute left-4 text-white z-50 h-20" onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length); }}><ChevronLeft size={40} /></Button>
              <Button variant="ghost" className="absolute right-4 text-white z-50 h-20" onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((prev) => (prev + 1) % allPhotos.length); }}><ChevronRight size={40} /></Button>
            </>
          )}
          <img src={allPhotos[currentPhotoIdx]} className="max-w-full max-h-full object-contain" alt="Gallery"/>
          <div className="absolute bottom-10 text-white/50 font-black text-xs tracking-widest">{currentPhotoIdx + 1} / {allPhotos.length}</div>
        </DialogContent>
      </Dialog>

      {/* МОДАЛКА ЗАКАЗА / КОРЗИНЫ */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[400px]">
          <DialogHeader><DialogTitle className="font-black uppercase text-center text-xl">{mode === "quick" ? "Быстрый заказ" : "В корзину"}</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center p-5 bg-blue-50 rounded-[2rem]">
              <span className="text-[10px] font-black text-blue-400 uppercase mb-3">Количество (шаг 6)</span>
              <div className="flex items-center gap-8">
                <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-sm" onClick={() => setTotalPairs(Math.max(6, totalPairs - 6))}><Minus size={16}/></Button>
                <span className="text-3xl font-black">{totalPairs}</span>
                <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-sm" onClick={() => setTotalPairs(totalPairs + 6)}><Plus size={16}/></Button>
              </div>
            </div>
            {mode === "quick" && (
              <div className="space-y-3">
                <Input placeholder="Ваше имя" className="h-12 rounded-xl bg-slate-50 border-none" value={name} onChange={e => setName(e.target.value)} />
                <Input placeholder="Телефон" className="h-12 rounded-xl bg-slate-50 border-none" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            )}
            <Button onClick={handleAction} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">
              {mode === "quick" ? "Оформить" : "Добавить"} — {(product.price * totalPairs).toLocaleString()} сом
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
        }
