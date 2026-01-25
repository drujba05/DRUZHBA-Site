import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { ZoomIn, X } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [orderOpen, setOrderOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.min_order_quantity);

  const handleAddToCart = () => {
    addItem(product, product.min_order_quantity);
    toast({ title: "Добавлено", description: "Товар в корзине" });
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Фото */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f9f9f9' }}>
        <img src={product.main_photo} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
      </div>

      {/* Заголовок и цена */}
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

      {/* ТЕ САМЫЕ БЛОКИ (ИСПРАВЛЕННЫЕ) */}
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

      {/* ОКНО ПОКУПКИ (БЕЛОЕ) */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent style={{ backgroundColor: 'white', color: 'black', padding: '20px', borderRadius: '16px', border: 'none' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Быстрый заказ</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f4f6', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
            <button onClick={() => setQuantity(Math.max(6, quantity - 6))} style={{ fontSize: '20px', padding: '0 15px' }}>-</button>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{quantity} пар</span>
            <button onClick={() => setQuantity(quantity + 6)} style={{ fontSize: '20px', padding: '0 15px' }}>+</button>
          </div>
          <Input placeholder="Ваше имя" style={{ marginBottom: '10px', backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
          <Input placeholder="Ваш телефон" style={{ marginBottom: '15px', backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
          <Button onClick={() => setOrderOpen(false)} style={{ width: '100%', background: '#2563eb', color: 'white', height: '45px', fontWeight: 'bold' }}>
            ОФОРМИТЬ
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
