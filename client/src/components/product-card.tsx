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

  useEffect(() => {
    if (imageViewerOpen && allPhotos.length > 1) {
      allPhotos.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [imageViewerOpen, allPhotos]);

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
    if (quantity % 6 !== 0) {
      toast({
        title: "Ошибка",
        description: "Заказ возможен только кратно 6 пар",
        variant: "destructive",
      });
      return;
    }

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
          description: `Менеджер свяжется с вами для подтверждения заказа на ${quantity} пар.`,
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить заказ. Попробуйте позже.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заказ. Попробуйте позже.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "В наличии": return "bg-green-500 hover:bg-green-600";
      case "Нет в наличии": return "bg-red-500 hover:bg-red-600";
      case "Ожидается поступление": return "bg-yellow-500 hover:bg-yellow-600";
      default: return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <Card className="h-full flex flex-col overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-white">
        <div 
          className="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer"
          onClick={() => {
            setCurrentImageIndex(0);
            setImageViewerOpen(true);
          }}
        >
          <img 
            src={product.main_photo} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4" />
          </div>
          {allPhotos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              +{allPhotos.length - 1} фото
            </div>
          )}
        </div>

        <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-0" aria-describedby={undefined}>
            <DialogHeader className="sr-only">
              <DialogTitle>{product.name}</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setImageViewerOpen(false)}
              className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            
            <div className="relative flex items-center justify-center min-h-[70vh] group/viewer overflow-hidden touch-pan-y">
              <motion.img 
                key={currentImageIndex}
                src={allPhotos[currentImageIndex]} 
                alt={`${product.name} - фото ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain cursor-grab active:cursor-grabbing"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
                drag={allPhotos.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) {
                    nextImage();
                  } else if (info.offset.x > 50) {
                    prevImage();
                  }
                }}
              />
              
              {allPhotos.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 bg-green-500 hover:bg-green-600 rounded-full p-3 transition-all shadow-lg opacity-0 group-hover/viewer:opacity-100 active:opacity-100 focus:opacity-100"
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 bg-green-500 hover:bg-green-600 rounded-full p-3 transition-all shadow-lg opacity-0 group-hover/viewer:opacity-100 active:opacity-100 focus:opacity-100"
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {allPhotos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-green-500' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 text-white text-center">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-white/70">{currentImageIndex + 1} из {allPhotos.length}</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cart Color Selection Dialog */}
        <Dialog open={cartDialogOpen} onOpenChange={setCartDialogOpen}>
          <DialogContent className="sm:max-w-[300px]">
            <DialogHeader>
              <DialogTitle>Выберите цвет</DialogTitle>
              <DialogDescription>
                {product.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите цвет" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleAddToCart} className="w-full">
                Добавить в корзину
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <CardHeader className="pb-2 p-3">
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge className={`${getStatusColor(product.status)} text-white border-0 text-[10px]`}>
              {product.status}
            </Badge>
            {product.is_bestseller && (
              <Badge className="bg-orange-500 text-white border-0 gap-1 text-[10px]">
                <Flame className="h-3 w-3" /> Хит
              </Badge>
            )}
            {product.is_new && (
              <Badge className="bg-green-500 text-white border-0 gap-1 text-[10px]">
                <Sparkles className="h-3 w-3" /> Новинка
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-[15px] font-semibold line-clamp-2 leading-tight" title={product.name}>
              {product.name}
            </CardTitle>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-800">
                {product.price}
              </span>
              <span className="text-sm font-bold" style={{ color: '#374151' }}>сом/пара</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-0 flex-grow text-xs space-y-2">
          {product.comment && (
            <div className="rounded-md p-2" style={{ backgroundColor: 'rgba(88, 28, 135, 0.9)' }}>
              <p className="text-[11px]" style={{ color: '#ffffff' }}>{product.comment}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50 text-center">
              <p className="text-[11px] font-bold" style={{ color: '#374151' }}>Размеры</p>
              <p className="font-bold text-foreground text-[12px]">{product.sizes}</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50 text-center">
              <p className="text-[11px] font-bold" style={{ color: '#374151' }}>Мин. заказ</p>
              <p className="font-bold text-foreground text-[12px]">{product.min_order_quantity} пар</p>
            </div>
          </div>
          <div className="rounded-md p-2" style={{ backgroundColor: 'rgba(126, 34, 206, 0.85)' }}>
            <p className="text-[11px] line-clamp-1" style={{ color: '#ffffff' }}>{product.colors}</p>
          </div>
          <div className="border border-gray-300 rounded-md p-2 bg-gray-50 text-center">
            <p className="text-[11px] font-bold" style={{ color: '#374151' }}>В коробке</p>
            <p className="font-bold text-foreground text-[12px]">{product.pairs_per_box || 12} пар</p>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-1 grid grid-cols-2 gap-2">
          <Button 
            className="h-10 text-sm bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
            disabled={product.status === "Нет в наличии"}
            onClick={handleAddToCart}
          >
            В корзину
          </Button>
          <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
            <DialogTrigger asChild>
              <Button 
                className="h-10 text-sm" 
                disabled={product.status === "Нет в наличии"}
              >
                {product.status === "Ожидается поступление" ? "Предзаказ" : "Купить"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Оформление заказа</DialogTitle>
                <DialogDescription>
                  {product.name} (Арт: {product.sku})
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBuy} className="grid gap-4 py-4">
                {colorOptions.length > 1 && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">
                      Цвет
                    </Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Выберите цвет" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Количество пар</Label>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-12 w-12 text-xl font-bold"
                      onClick={() => setQuantity(Math.max(6, quantity - 6))}
                      disabled={quantity <= 6}
                      data-testid="quantity-decrease"
                    >
                      −
                    </Button>
                    <div className="text-center min-w-[80px]">
                      <span className="text-3xl font-bold" data-testid="quantity-display">{quantity}</span>
                      <p className="text-xs text-muted-foreground">пар</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-12 w-12 text-xl font-bold"
                      onClick={() => setQuantity(quantity + 6)}
                      data-testid="quantity-increase"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Имя
                  </Label>
                  <Input id="name" name="name" placeholder="Ваше имя" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Телефон
                  </Label>
                  <Input id="phone" name="phone" placeholder="+996..." className="col-span-3" required />
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={handleAddToCart} className="w-full">
                    В корзину
                  </Button>
                  <Button type="submit" className="w-full">Купить сейчас</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
