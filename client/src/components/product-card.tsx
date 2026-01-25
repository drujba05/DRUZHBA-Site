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
  const [quantity, setQuantity] = useState(product.min_order_quantity);

  const handleAddToCart = () => {
    addItem(product, product.min_order_quantity);
    toast({ title: "Добавлено", description: "Товар в корзине" });
  };

  const handleBuySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          quantity,
          customerName: formData.get("name"),
          customerPhone: formData.get("phone"),
          totalPrice: product.price * quantity,
        }),
      });
      if (response.ok) {
        setOrderOpen(false);
        toast({ title: "Заказ оформлен!", description: "Мы скоро свяжемся с вами." });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Фото */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f9f9f9' }}>
        <img src={product.main_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Инфо */}
      <div style={{ padding: '8px' }}>
        <div style={{ background: '#22c55e', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', fontWeight: 'bold', marginBottom: '4px' }}>
          {product.status}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'black', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '900', color: '#2563eb', marginTop: '2px' }}>
          {product.price} сом/пара
        </div>
      </div>

      {/* Размеры и Мин заказ */}
      <div style={{ padding: '0 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px', textAlign: 'center', background: '#f9fafb' }}>
          <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Размеры</div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#374151', lineHeight: '1.1' }}>{product.sizes}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px', textAlign: 'center', background: '#f9fafb' }}>
          <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Мин. заказ</div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#111827' }}>{product.min_order_quantity}п.</div>
        </div>
      </div>

      {/* Кнопки */}
      <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <button onClick={handleAddToCart} style={{ height: '32px', fontSize: '11px', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', fontWeight: 'bold', background: 'white' }}>
          В корзину
        </button>
        <button onClick={() => setOrderOpen(true)} style={{ height: '32px', fontSize: '11px', background: '#2563eb', color: 'white', borderRadius: '6px', fontWeight: 'bold', border: 'none' }}>
          КУПИТЬ
        </button>
      </div>

      {/* ОКНО ПОКУПКИ (БЕЛОЕ, НЕПРОЗРАЧНОЕ) */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent 
          style={{ 
            backgroundColor: '#ffffff', 
            color: '#000000', 
            padding: '24px', 
            borderRadius: '16px', 
            border: 'none',
            maxWidth: '340px',
            width: '90%'
          }}
        >
          {/* Свои заголовки вместо системных, чтобы не были прозрачными */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000' }}>Быстрый заказ</div>
            <div style={{ fontSize: '12px', color: '#666666' }}>{product.name}</div>
          </div>

          <form onSubmit={handleBuySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Счетчик */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f4f6', padding: '8px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <button type="button" onClick={() => setQuantity(Math.max(6, quantity - 6))} style={{ fontSize: '24px', padding: '0 15px', color: '#2563eb', background: 'none', border: 'none' }}>−</button>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000' }}>{quantity} пар</span>
              <button type="button" onClick={() => setQuantity(quantity + 6)} style={{ fontSize: '24px', padding: '0 15px', color: '#2563eb', background: 'none', border: 'none' }}>+</button>
            </div>

            {/* Поля ввода */}
            <input 
              name="name"
              placeholder="Ваше имя" 
              required
              style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cccccc', backgroundColor: '#ffffff', color: '#000000', fontSize: '14px' }} 
            />
            <input 
              name="phone"
              placeholder="Ваш телефон" 
              required
              style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cccccc', backgroundColor: '#ffffff', color: '#000000', fontSize: '14px' }} 
            />

            {/* Кнопка */}
            <button 
              type="submit" 
              style={{ width: '100%', background: '#2563eb', color: '#ffffff', height: '48px', fontWeight: 'bold', borderRadius: '8px', border: 'none', fontSize: '15px', marginTop: '4px' }}
            >
              ОФОРМИТЬ ЗАКАЗ
            </button>
            
            <button 
              type="button"
              onClick={() => setOrderOpen(false)}
              style={{ width: '100%', background: 'none', color: '#999999', fontSize: '12px', border: 'none', marginTop: '4px' }}
            >
              Отмена
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
            }
