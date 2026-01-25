import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus, Send, User, Phone, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function CartDrawer() {
  const { items, removeItem, addItem, clearCart } = useCart();
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Считаем итоги прямо здесь, чтобы не зависеть от функций в cart.ts
  const totals = useMemo(() => {
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
    return { totalQty, totalPrice };
  }, [items]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: "Заполните данные",
        description: "Укажите ваше имя и номер телефона.",
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
          })),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          totalPrice: totals.totalPrice,
        }),
      });

      if (response.ok) {
        toast({ title: "Заказ отправлен!", description: "Менеджер скоро свяжется с вами." });
        clearCart();
        setCustomerName("");
        setCustomerPhone("");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось отправить заказ.", variant: "destructive" });
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
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-purple-900">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white text-black p-0 border-none">
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-black text-xl">
              <ShoppingCart className="h-6 w-6 text-blue-600" /> 
              Корзина <span className="text-gray-400 text-sm font-normal">({totals.totalQty} пар)</span>
            </SheetTitle>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center space-y-4 p-6">
            <div className="bg-gray-50 p-8 rounded-full text-gray-300">
              <ShoppingCart className="h-16 w-16" />
            </div>
            <p className="text-gray-500 font-medium">Ваша корзина пуста</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 group">
                    <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0 shadow-sm">
                      <img src={item.main_photo} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {item.price} сом/пара {item.selectedColor && `• Цвет: ${item.selectedColor}`}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-gray-50">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:bg-white"
                            onClick={() => removeItem(item.productId, item.min_order_quantity || 6)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 text-xs font-bold text-gray-700">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:bg-white"
                            onClick={() => addItem(item, item.min_order_quantity || 6)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.productId, item.quantity)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 bg-gray-50/50 border-t space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Общее количество</span>
                  <span className="font-medium">{totals.totalQty} пар</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900">
                  <span>Итого</span>
                  <span className="text-blue-700">{totals.totalPrice} сом</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Ваше имя" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Номер телефона" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <Button 
                className="w-full h-12 text-base font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition-all shadow-lg shadow-blue-200" 
                onClick={handleCheckout}
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                {isSubmitting ? "Отправка..." : "Оформить заказ через WhatsApp"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
