import { useProducts, Product } from "@/lib/products";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Upload, Loader2, Lock, Edit, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "", sku: "TEST-001", category: "Обувь", description: "Описание",
    price: 100, sizes: "36-41", colors: "Черный", status: "В наличии",
    season: "Лето", min_order_quantity: 1, pairs_per_box: 1,
    main_photo: "", additional_photos: [], is_bestseller: false, is_new: true
  });

  const handleLogin = () => {
    if (password === "Medina050891") setIsAuthenticated(true);
    else toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Прямое сохранение без сжатия для теста
      setFormData({ ...formData, main_photo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name) return toast({ title: "Введите название!" });
    
    setIsSubmitting(true);
    try {
      console.log("Отправка данных:", formData);
      if (editingId) {
        await updateProduct({ ...formData, id: editingId });
        toast({ title: "Обновлено!" });
      } else {
        await addProduct(formData);
        toast({ title: "Добавлено в базу!" });
      }
      
      // Сброс кэша и формы
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsFormOpen(false);
      setEditingId(null);
    } catch (error: any) {
      console.error("Ошибка при сохранении:", error);
      toast({ 
        title: "Критическая ошибка", 
        description: error.message || "Сервер не ответил", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Card className="p-8 w-80 space-y-4">
          <Lock className="mx-auto text-blue-600" />
          <Input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <Button className="w-full" onClick={handleLogin}>Войти</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border mb-6">
        <h1 className="text-xl font-black uppercase">Товары на сайте: {products?.length || 0}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products"] })}>
            <RefreshCw size={16} />
          </Button>
          <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? "ОТМЕНА" : "+ ДОБАВИТЬ"}
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card className="p-6 mb-8 border-2 border-blue-500 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="border-2 border-dashed rounded-xl h-40 flex items-center justify-center relative bg-gray-50 overflow-hidden">
                {formData.main_photo ? <img src={formData.main_photo} className="w-full h-full object-cover" /> : <Upload className="text-gray-300" />}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhoto} />
              </div>
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Загрузить фото</p>
            </div>
            <div className="space-y-4">
              <Input placeholder="Название" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input type="number" placeholder="Цена" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              <Button className="w-full h-12 bg-green-600 font-bold" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "СОХРАНИТЬ"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-2" />
          <p className="text-gray-400 font-bold">Загрузка базы...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {products?.map(p => (
            <div key={p.id} className="bg-white border rounded-2xl p-2 relative group shadow-sm">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                <img src={p.main_photo} className="w-full h-full object-cover" />
              </div>
              <p className="font-bold text-[10px] truncate uppercase">{p.name}</p>
              <p className="text-blue-600 font-black text-xs">{p.price} сом</p>
              <div className="flex gap-1 mt-2">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { setEditingId(p.id); setFormData(p); setIsFormOpen(true); }}><Edit size={14}/></Button>
                <Button size="icon" variant="outline" className="h-8 w-8 text-red-500" onClick={() => confirm('Удалить?') && deleteProduct(p.id)}><Trash2 size={14}/></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && products?.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
          <AlertCircle className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-400 uppercase font-black text-sm tracking-widest">База пуста</p>
        </div>
      )}
    </div>
  );
                  }
