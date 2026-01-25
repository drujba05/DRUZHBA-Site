import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { ChevronLeft, ChevronRight, X, ZoomIn, Flame, Sparkles, ShoppingCart } from "lucide-react";

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const handleAddToCart = () => {
    if (colorOptions.length > 1 && !cartDialogOpen) {
      setCartDialogOpen(true);
      return;
    }
    addItem(product, product.min_order_quantity, selectedColor);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name}${selectedColor ? ` (${selectedColor})` : ""} — +${product.min_order_quantity} пар`,
    });
    setCartDialogOpen(false);
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const customerName = formData.get("name") as string;
    const customerPhone = formData.get("phone") as string;

    try {
      const response = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          productSku: product.sku,
          quantity,
          selectedColor,
          customerName,
          customerPhone,
          totalPrice: product.price * quantity,
          productPhoto: product.main_photo,
        }),
      });

      if (response.ok) {
        setOrderOpen(false);
        toast({
          title: "Заказ оформлен!",
          description: "Менеджер свяжется с вами в ближайшее время.",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "В наличии": return "bg-green-500";
      case "Нет в наличии": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }}>
      <Card className="h-full flex flex-col overflow-hidden shadow-md border-0 bg-white">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setImageViewerOpen(true)}>
          <img src={product.main_photo} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white rounded-full p-1.5"><ZoomIn className="h-4 w-4" /></div>
        </div>

        {/* ОСНОВНОЕ ОКНО ТОВАРА (ДИАЛОГ ПОСЛЕ НАЖАТИЯ КУПИТЬ) */}
        <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
          <DialogContent className="w-[95%] max-w-[425px] rounded-lg bg-white p-6 text-black border shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black">{product.name}</DialogTitle>
              <DialogDescription className="text-gray-600">Арт: {product.sku}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBuy} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-black font-bold">Количество пар</Label>
                <div className="flex items-center justify-center gap-4 bg-gray-50 p-2 rounded-lg border">
                  <Button type="button" variant="outline" onClick={() => setQuantity(Math.max(6, quantity - 6))}>-</Button>
                  <span className="text-2xl font-bold text-black">{quantity}</span>
                  <Button type="button" variant="outline" onClick={() => setQuantity(quantity + 6)}>+</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-black font-bold">Ваше имя</Label>
                <Input name="name" placeholder="Имя" className="bg-white text-black border-gray-300" required />
              </div>
              <div className="space-y-2">
                <Label className="text-black font-bold">Телефон</Label>
                <Input name="phone" placeholder="+996..." className="bg-white text-black border-gray-300" required />
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg">
                ПОДТВЕРДИТЬ ЗАКАЗ
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Выбор цвета */}
        <Dialog open={cartDialogOpen} onOpenChange={setCartDialogOpen}>
          <DialogContent className="bg-white text-black rounded-lg">
            <DialogHeader><DialogTitle>Выберите цвет</DialogTitle></DialogHeader>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="bg-white text-black border-gray-300">
                <SelectValue placeholder="Цвет" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {colorOptions.map((color) => <SelectItem key={color} value={color}>{color}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAddToCart} className="w-full bg-blue-600 text-white">Добавить</Button>
          </DialogContent>
        </Dialog>

        <CardHeader className="p-3">
          <div className="flex gap-1 mb-1">
            <Badge className={`${getStatusColor(product.status)} text-white`}>{product.status}</Badge>
          </div>
          <CardTitle className="text-sm font-bold text-black line-clamp-2">{product.name}</CardTitle>
          <div className="text-lg font-black text-blue-700">{product.price} сом/пара</div>
        </CardHeader>

        <CardContent className="p-3 pt-0 flex-grow space-y-2">
          <div className="grid grid-cols-2 gap-2">
             <div className="bg-gray-50 border p-2 rounded text-center">
                <p className="text-[10px] text-gray-500">Размеры</p>
                <p className="font-bold text-black">{product.sizes}</p>
             </div>
             <div className="bg-gray-50 border p-2 rounded text-center">
                <p className="text-[10px] text-gray-500">Мин. заказ</p>
                <p className="font-bold text-black">{product.min_order_quantity}п.</p>
             </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 grid grid-cols-2 gap-2">
          <Button variant="outline" className="border-blue-600 text-blue-600 font-bold" onClick={handleAddToCart}>
            В корзину
          </Button>
          <Button className="bg-blue-600 text-white font-bold" onClick={() => setOrderOpen(true)}>
            КУПИТЬ
          </Button>
        </CardFooter>
      </Card>
      
      {/* Просмотр фото */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-0">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            <img src={allPhotos[currentImageIndex]} className="max-h-[80vh] object-contain" />
            <Button className="absolute right-2 bg-white/20 text-white" onClick={nextImage}><ChevronRight /></Button>
            <Button className="absolute left-2 bg-white/20 text-white" onClick={prevImage}><ChevronLeft /></Button>
            <Button className="absolute top-2 right-2 text-white" onClick={() => setImageViewerOpen(false)}><X /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
