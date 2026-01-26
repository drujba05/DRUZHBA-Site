import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Ruler, Box, Palette, ChevronLeft, ChevronRight, X, Maximize2, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  
  // Состояния для модалок
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Состояния для галереи
  const allPhotos = [product.main_photo, ...(product.additional_photos || [])].filter(Boolean);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // Состояния заказа
  const [totalPairs, setTotalPairs] = useState(6);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-[#FDFDFD] flex flex-col h-full">
      
      {/* ПРЕВЬЮ ФОТО */}
      <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[2rem] bg-slate-100">
        <img
          src={product.main_photo}
          alt={product.name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
          onClick={() => { setCurrentPhotoIdx(0); setIsGalleryOpen(true); }}
        />
        <div className="absolute top-4 left-4 flex gap-1.5">
          {product.is_new && <Badge className="bg-green-500 border-none font-black text-[9px] px-2 py-1 shadow-lg">NEW</Badge>}
          {product.is_bestseller && <Badge className="bg-orange-500 border-none font-black text-[9px] px-2 py-1 shadow-lg">HIT</Badge>}
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
        <h3 className="font-black text-slate-900 text-[15px] uppercase mb-4 leading-tight min-h-[40px]">{product.name}</h3>

        {/* ПАРАМЕТРЫ В РАМКАХ */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Palette size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase">Цвета:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{product.colors || "Ассортимент"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Ruler size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase">Размеры:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{product.sizes}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <Box size={14} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase">В коробе:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{product.pairs_per_box || "12"} пар</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-end border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-blue-400 uppercase">Цена / пара</span>
            <span className="text-xl font-black text-blue-600">{product.price} сом</span>
          </div>
          <Button 
            onClick={() => setIsOrderOpen(true)}
            className="bg-slate-900 hover:bg-black text-white rounded-xl px-5 h-11 font-black text-[10px] uppercase tracking-wider"
          >
            Купить
          </Button>
        </div>
      </CardContent>

      {/* ГАЛЕРЕЯ (СЛАЙДЕР) */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none bg-black/95 flex items-center justify-center shadow-none">
          <Button 
            variant="ghost" 
            className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full z-50"
            onClick={() => setIsGalleryOpen(false)}
          >
            <X size={32} />
          </Button>

          {allPhotos.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                className="absolute left-4 text-white hover:bg-white/10 h-20 w-12 z-50"
                onClick={prevPhoto}
              >
                <ChevronLeft size={48} />
              </Button>
              <Button 
                variant="ghost" 
                className="absolute right-4 text-white hover:bg-white/10 h-20 w-12 z-50"
                onClick={nextPhoto}
              >
                <ChevronRight size={48} />
              </Button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
              src={allPhotos[currentPhotoIdx]} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-500"
              alt="Увеличенное фото"
            />
            
            {/* Индикатор страниц */}
            <div className="absolute bottom-10 text-white/50 font-black text-sm uppercase tracking-[0.3em]">
              {currentPhotoIdx + 1} / {allPhotos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* МОДАЛКА ЗАКАЗА */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[400px]">
          <DialogHeader><DialogTitle className="font-black uppercase text-center text-xl">Заказ товара</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center p-5 bg-blue-50 rounded-[2rem]">
              <span className="text-[10px] font-black text-blue-400 uppercase mb-3 tracking-widest">Количество пар</span>
              <div className="flex items-center gap-8">
                <Button variant="outline" className="h-10 w-10 rounded-full bg-white shadow-sm border-none" onClick={() => setTotalPairs(Math.max(6, totalPairs - 6))}><Minus size={16}/></Button>
                <span className="text-3xl font-black text-slate-800">{totalPairs}</span>
                <Button variant="outline" className="h-10 w-10 rounded-full bg-white shadow-sm border-none" onClick={() => setTotalPairs(totalPairs + 6)}><Plus size={16}/></Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Input placeholder="Ваше имя" className="h-12 rounded-xl bg-slate-50 border-none" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Ваш телефон" className="h-12 rounded-xl bg-slate-50 border-none" value={phone} onChange={e => setPhone(e.target.value)} />
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Оформить заказ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
      }
