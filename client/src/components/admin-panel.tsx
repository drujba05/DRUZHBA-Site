import { useState } from "react";
import { Product } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, ImagePlus, Loader2, Package } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";

export function AdminPanel({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }: any) {
  const { toast } = useToast();
  const { uploadFile } = useUpload();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", price: "", season: "Все сезоны", colors: "", 
    pairs_per_box: "12", min_order_quantity: "6", main_photo: ""
  });

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      price: String(p.price),
      season: p.season || "Все сезоны",
      colors: p.colors || "",
      pairs_per_box: String(p.pairs_per_box || 12),
      min_order_quantity: String(p.min_order_quantity || 6),
      main_photo: p.main_photo
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: Number(formData.price),
      pairs_per_box: Number(formData.pairs_per_box),
      min_order_quantity: Number(formData.min_order_quantity),
      category: "Обувь",
      status: "В наличии",
      sizes: "36-41",
      additional_photos: []
    };

    if (editingId) {
      await onUpdateProduct(editingId, data);
      setEditingId(null);
      toast({ title: "Обновлено" });
    } else {
      await onAddProduct(data);
      toast({ title: "Добавлено" });
    }
    setFormData({ name: "", price: "", season: "Все сезоны", colors: "", pairs_per_box: "12", min_order_quantity: "6", main_photo: "" });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', fontFamily: 'sans-serif' }}>
      
      {/* ЛЕВАЯ ЧАСТЬ: ФОРМА */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
        <h2 style={{ marginBottom: '20px', fontWeight: 'bold' }}>
          {editingId ? "📝 Редактировать" : "➕ Добавить товар"}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            placeholder="Название товара" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            required 
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input 
              type="number" placeholder="Цена" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
              required 
            />
            <select 
              value={formData.season} 
              onChange={e => setFormData({...formData, season: e.target.value})}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="Лето">Лето</option>
              <option value="Зима">Зима</option>
              <option value="Демисезон">Демисезон</option>
              <option value="Все сезоны">Все сезоны</option>
            </select>
          </div>
          <input 
            placeholder="Цвета (черный, белый...)" 
            value={formData.colors} 
            onChange={e => setFormData({...formData, colors: e.target.value})}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          <input 
            placeholder="Ссылка на фото" 
            value={formData.main_photo} 
            onChange={e => setFormData({...formData, main_photo: e.target.value})}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          <button 
            type="submit" 
            style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {editingId ? "СОХРАНИТЬ" : "ДОБАВИТЬ ТОВАР"}
          </button>
          {editingId && <button type="button" onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: '#666' }}>Отмена</button>}
        </form>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: СПИСОК */}
      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Package size={16} /> ТОВАРЫ ({products?.length || 0})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {products?.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={p.main_photo} style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{p.name.substring(0, 15)}...</div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEdit(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb' }}><Pencil size={14}/></button>
                <button onClick={() => {if(confirm('Удалить?')) onDeleteProduct(p.id)}} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
                 }
