import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [orderOpen, setOrderOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.min_order_quantity || 6);
  const [selectedColor, setSelectedColor] = useState("");

  const handleAddToCart = () => {
    addItem(product, product.min_order_quantity);
    toast({ title: "Добавлено", description: "Товар в корзине" });
  };

  const handleBuySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Если цвет не выбран, берем первый из списка или пишем "Не указан"
    const colorToSend = selectedColor || (product.colors ? product.colors.split(',')[0].trim() : "Стандарт");

    try {
      const response = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          sku: product.sku || `ID-${product.id}`,
          color: colorToSend,
          quantity,
          customerName: formData.get("name"),
          customerPhone: formData.get("phone"),
          totalPrice: product.price * quantity,
        }),
      });
      if (response.ok) {
        setOrderOpen(false);
        toast({ title: "Заказ оформлен!", description: "Мы скоро свяжемся с вами в Telegram." });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось отправить заказ" });
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      {/* Фото */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f9f9f9' }}>
        <img src={product.main_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {product.is_new && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#22c55e', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: 'bold' }}>NEW</div>
        )}
      </div>

      {/* Инфо */}
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
           <div style={{ background: '#f3f4f6', color: '#374151', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
            {product.status}
          </div>
          <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 'bold' }}>{product.season}</div>
        </div>
        
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'black', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>

        {/* ЦВЕТА НА КАРТОЧКЕ */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
          {product.colors && product.colors.split(',').map((c, i) => (
            <span key={i} style={{ fontSize: '9px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 5px', borderRadius: '4px', color: '#64748b' }}>
              {c.trim()}
            </span>
          ))}
        </div>

        <div style={{ fontSize: '16px', fontWeight: '900', color: '#2563eb', marginTop: '6px' }}>
          {product.price} сом <span style={{fontSize: '10px', fontWeight: 'normal', color: '#666'}}>за пару</span>
        </div>
      </div>

      {/* Коробка и Мин заказ */}
      <div style={{ padding: '0 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px', textAlign: 'center', background: '#f9fafb' }}>
          <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>В коробке</div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#374151' }}>{product.pairs_per_box || 12} пар</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px', textAlign: 'center', background: '#f9fafb' }}>
          <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Мин. заказ</div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#111827' }}>{product.min_order_quantity}п.</div>
        </div>
      </div>

      {/* Кнопки */}
      <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: 'auto' }}>
        <button onClick={handleAddToCart} style={{ height: '36px', fontSize: '11px', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '8px', fontWeight: 'bold', background: 'white' }}>
          В корзину
        </button>
        <button onClick={() => setOrderOpen(true)} style={{ height: '36px', fontSize: '11px', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}>
          КУПИТЬ
        </button>
      </div>

      {/* ОКНО ПОКУПКИ */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent style={{ backgroundColor: '#ffffff', color: '#000000', padding: '24px', borderRadius: '16px', border: 'none', maxWidth: '360px', width: '95%' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000' }}>Быстрый заказ</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{product.name}</div>
          </div>

          <form onSubmit={handleBuySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* ВЫБОР ЦВЕТА ВНУТРИ ЗАКАЗА */}
            {product.colors && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Выберите цвет:</label>
                <select 
                  value={selectedColor} 
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #ddd', padding: '0 10px', fontSize: '14px', background: '#fff' }}
                >
                  <option value="">-- Нажмите чтобы выбрать --</option>
                  {product.colors.split(',').map((c, i) => (
                    <option key={i} value={c.trim()}>{c.trim()}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Счетчик */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <button type="button" onClick={() => setQuantity(Math.max(product.min_order_quantity, quantity - (product.pairs_per_box || 6)))} style={{ fontSize: '24px', width: '40px', color: '#2563eb', background: 'none', border: 'none' }}>−</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{quantity} пар</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Итого: {product.price * quantity} сом</div>
              </div>
              <button type="button" onClick={() => setQuantity(quantity + (product.pairs_per_box || 6))} style={{ fontSize: '24px', width: '40px', color: '#2563eb', background: 'none', border: 'none' }}>+</button>
            </div>

            <input name="name" placeholder="Ваше имя" required style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
            <input name="phone" placeholder="Ваш телефон (WhatsApp)" required style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />

            <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#ffffff', height: '50px', fontWeight: 'bold', borderRadius: '10px', border: 'none', fontSize: '16px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
              ОФОРМИТЬ ЗАКАЗ
            </button>
            
            <button type="button" onClick={() => setOrderOpen(false)} style={{ width: '100%', background: 'none', color: '#94a3b8', fontSize: '13px', border: 'none' }}>
              Вернуться к просмотру
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
    }
