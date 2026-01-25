import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus, Send, User, Phone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: "Заполните данные",
        description: "Укажите ваше имя и номер телефона для связи.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor,
            main_photo: item.main_photo,
          })),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          totalPrice: totalPrice(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Заказ отправлен!",
          description: "Менеджер свяжется с вами в ближайшее время.",
        });
        clearCart();
        setCustomerName("");
        setCustomerPhone("");
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-white/10 border-white/20 text-white hover:bg-white/20">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-black">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      {/* МЫ ИЗМЕНИЛИ ЭТУ СТРОКУ НИЖЕ, ДОБАВИВ bg-white и text-black */}
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white text-black border-l border-gray-200 shadow-xl opacity-100">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-black">
            <ShoppingCart className="h-5 w-5" /> Корзина ({totalItems()} пар)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center space-y-4 bg-white">
            <div className="bg-gray-100 p-6 rounded-full">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Ваша корзина пуста</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow pr-4 -mr-4 mt-6">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.selectedColor || index}`} className="flex gap-4 border-b pb-4 border-gray-100">
                    <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                      <img src={item.main_photo} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h4 className="font-bold text-sm text-black line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        {item.category} • {item.price} сом/пара
                        {item.selectedColor && <span className="ml-1">• {item.selectedColor}</span>}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-gray-300 rounded-md bg-white">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-none text-black hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, Math.max(item.min_order_quantity, item.quantity - 6), item.selectedColor)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-bold text-black">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-none text-black hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 6, item.selectedColor)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(item.id, item.selectedColor)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-6 bg-white">
              <Separator className="bg-gray-200" />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-black">
                  <span className="text-gray-500">Товаров в корзине</span>
                  <span>{items.length} поз.</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-black">
                  <span>Итого к оплате</span>
                  <span className="text-primary">{totalPrice()} сом</span>
                </div>
              </div>

              <Separator className="bg-gray-200" />
              
              <div className="space-y-3">
                <p className="text-sm font-semibold text-black">Ваши контактные данные:</p>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Ваше имя" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="+996..." 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <SheetFooter className="flex flex-col gap-2 pb-4">
                <Button 
                  className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white" 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-5 w-5" /> 
                  {isSubmitting ? "Отправка..." : "Оформить заказ"}
                </Button>
                <p className="text-[10px] text-center text-gray-400">
                  После оформления менеджер свяжется с вами для уточнения деталей доставки и оплаты.
                </p>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
