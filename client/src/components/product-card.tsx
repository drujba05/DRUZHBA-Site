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
import { ChevronLeft, ChevronRight, X, ZoomIn, Flame, Sparkles } from "lucide-react";

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
      title: "Добавлено",
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
        toast({ title: "Заказ оформлен!" });
      }
    } catch (e) { console.error(e); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full flex flex-col overflow-hidden shadow-sm border-gray-200 bg-white">
        {/* Фото товара */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer" onClick={() => setImageViewerOpen(true)}>
          <img src={product.main_photo} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-1 right-1 bg-black/40 text-white p-1 rounded-full"><ZoomIn className="h-3 w-3" /></div>
        </div>

        <CardHeader className="p-2 pb-0">
          <Badge className="w-fit text-[9px] px-1 py-0 mb-1 bg-green-600 text-white border-0">{product.status}</Badge>
          <CardTitle className="text-[13px] font-bold line-clamp-1 text-black">{product.name}</CardTitle>
          <div className="text-blue-700 font-extrabold text-[15px]">{product.price} сом/пара</div>
        </CardHeader>

        <CardContent className="p-2 pt-1 flex-grow space-y-1.5">
          {/* Блок размеров и мин заказа - СДЕЛАЛ МЕНЬШЕ ШРИФТ */}
          <div className="grid grid-cols-2 gap-1">
            <div className="border border-gray-200 rounded p-1 bg-gray-50 flex flex-col items-center justify-center">
              <span className="text-[8px] uppercase text-gray-500 font-bold">Размеры</span>
              <span className="text-[10px] font-black text-center leading-tight text-gray-800">{product.sizes}</span>
            </div>
            <div className="border border-gray-200 rounded p-1 bg-gray-50 flex flex-col items-center justify-center">
              <span className="text-[8px] uppercase text-gray-500 font-bold">Мин. заказ</span>
              <span className="text-[11px] font-black text-gray-800">{product.min_order_quantity}п.</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-2 pt-0 grid grid-cols-2 gap-1">
          <Button variant="outline" className="h-8 text-[11px] border-blue-600 text-blue-600 px-1" onClick={handleAddToCart}>Корзина</Button>
          <Button className="h-8 text-[11px] bg-blue-600 text-white px-1" onClick={() => setOrderOpen(true)}>КУПИТЬ</Button>
        </CardFooter>

        {/* ОКНО ПОКУПКИ - ФИКС ПРОЗРАЧНОСТИ */}
        <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
          <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[350px] bg-white p-5 rounded-xl border shadow-2xl z-[100] text-black block">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-bold text-black">Оформить заказ</DialogTitle>
              <p className="text-xs text-gray-600">{product.name}</p>
            </DialogHeader>
            <form onSubmit={handleBuy} className="space-y-3">
              <div className="bg-gray-50 p-2 rounded border flex items-center justify-between">
                <Button type="button" size="sm" variant="outline" onClick={() => setQuantity(Math.max(6, quantity - 6))}>-</Button>
                <div className="text-center"><span className="text-xl font-bold">{quantity}</span><span className="text-[10px] ml-1">пар</span></div>
                <Button type="button" size="sm" variant="outline" onClick={() => setQuantity(quantity + 6)}>+</Button>
              </div>
              <Input name="name" placeholder="Ваше имя" className="h-10 text-black bg-white border-gray-300" required />
              <Input name="phone" placeholder="Ваш телефон" className="h-10 text-black bg-white border-gray-300" required />
              <Button type="submit" className="w-full h-10 bg-blue-600 text-white font-bold">ОТПРАВИТЬ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}
