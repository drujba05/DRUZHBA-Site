import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [orderOpen, setOrderOpen] = useState(false);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(product.min_order_quantity);
  
  const colorOptions = product.colors.split(/[,،;\/]+/).map(c => c.trim()).filter(Boolean);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "");
  const allPhotos = [product.main_photo, ...(product.additional_photos || [])].filter(Boolean);

  const handleAddToCart = () => {
    if (colorOptions.length > 1 && !cartDialogOpen) {
      setCartDialogOpen(true);
      return;
    }
    addItem(product, product.min_order_quantity, selectedColor);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} — ${product.min_order_quantity} пар`,
    });
    setCartDialogOpen(false);
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const response = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          quantity,
          selectedColor,
          customerName: formData.get("name"),
          customerPhone: formData.get("phone"),
          totalPrice: product.price * quantity,
        }),
      });
      if (response.ok) {
        setOrderOpen(false);
        toast({ title: "Заказ оформлен!", description: "Мы свяжемся с вами." });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="h-full flex flex-col overflow-hidden shadow-sm border-gray-200 bg-white">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 cursor-pointer" onClick={() => setImageViewerOpen(true)}>
          <img src={product.main_photo} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-1 right-1 bg-black/30 text-white p-1 rounded-full"><ZoomIn className="h-3 w-3" /></div>
        </div>

        <CardHeader className="p-2 pb-0 space-y-0.5">
          <Badge className="w-fit text-[9px] px-1 py-0 bg-green-500 text-white border-0 uppercase font-bold">
            {product.status}
          </Badge>
          <CardTitle className="text-[13px] font-bold text-black line-clamp-1 leading-tight">{product.name}</CardTitle>
          <div className="text-blue-600 font-black text-[15px]">{product.price} сом/пара</div>
        </CardHeader>

        <CardContent className="p-2 pt-1 flex-grow space-y-1">
          {/* ТЕ САМЫЕ БЛОКИ С МАЛЕНЬКИМ ШРИФТОМ */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="border border-gray-100 rounded-lg p-1.5 bg-gray-50/50 flex flex-col items-center justify-center min-h-[45px]">
              <span className="text-[8px] text-gray-400 uppercase font-bold">Размеры</span>
              <span className="text-[10px] font-bold text-gray-700 text-center leading-none mt-0.5">{product.sizes}</span>
            </div>
            <div className="border border-gray-100 rounded-lg p-1.5 bg-gray-50/50 flex flex-col items-center justify-center min-h-[45px]">
              <span className="text-[8px] text-gray-400 uppercase font-bold">Мин. заказ</span>
              <span className="text-[11px] font-black text-gray-800 mt-0.5">{product.min_order_quantity}п.</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-2 pt-0 grid grid-cols-2 gap-1.5">
          <Button variant="outline" className="h-8 text-[11px] border-blue-600 text-blue-600 font-bold hover:bg-blue-50" onClick={handleAddToCart}>
            В корзину
          </Button>
          <Button className="h-8 text-[11px] bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm" onClick={() => setOrderOpen(true)}>
            КУПИТЬ
          </Button>
        </CardFooter>

        {/* ОКНО ЗАКАЗА - ПРИНУДИТЕЛЬНО БЕЛОЕ */}
        <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
          <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[92%] max-w-[360px] bg-white p-6 rounded-2xl border-0 shadow-2xl z-[9999]">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-bold text-black">Быстрый заказ</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">{product.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBuy} className="space-y-4 mt-2">
              <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between border">
                <Button type="button" size="sm" variant="ghost" className="text-xl font-bold text-blue-600" onClick={() => setQuantity(Math.max(6, quantity - 6))}>−</Button>
                <div className="text-center"><span className="text-2xl font-black text-black">{quantity}</span><span className="text-xs text-gray-500 ml-1">пар</span></div>
                <Button type="button" size="sm" variant="ghost" className="text-xl font-bold text-blue-600" onClick={() => setQuantity(quantity + 6)}>+</Button>
              </div>
              <Input name="name" placeholder="Ваше имя" className="h-11 bg-white border-gray-200 text-black rounded-xl" required />
              <Input name="phone" placeholder="Номер телефона" className="h-11 bg-white border-gray-200 text-black rounded-xl" required />
              <Button type="submit" className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-md shadow-lg shadow-blue-200">
                ОФОРМИТЬ ЗАКАЗ
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
      
      {/* Просмотр фото */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-[95vw] p-0 bg-black/95 border-0 rounded-xl overflow-hidden">
          <div className="relative flex items-center justify-center min-h-[50vh]">
            <img src={allPhotos[currentImageIndex]} className="max-h-[70vh] w-full object-contain" />
            <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full" onClick={() => setImageViewerOpen(false)}><X /></button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
              }
