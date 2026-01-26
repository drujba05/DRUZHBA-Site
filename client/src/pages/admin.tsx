import { useProducts, Product } from "@/lib/products";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query"; // Для мгновенного обновления
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Upload, Loader2, Lock, Edit, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Инструмент для сброса кэша
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "", sku: "", category: "Обувь", description: "",
    price: 0, sizes: "36-41", colors: "", status: "В наличии",
    season: "Лето", min_order_quantity: 6, pairs_per_box: 12,
    main_photo: "", additional_photos: [], is_bestseller: false, is_new: true
  });

  // Вход
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Card className="p-8 w-full max-w-xs text-center space-y-4">
          <Lock className="mx-auto text-blue-600" />
          <h1 className="font-bold">АДМИН-ДОСТУП</h1>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" />
          <Button className="w-full" onClick={() => password === "Medina050891" ? setIsAuthenticated(true) : alert("Нет!")}>Войти</Button>
        </Card>
      </div>
    );
  }

  // Загрузка фото + сжатие
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 600; canvas.height = 600;
        canvas.getContext("2d")?.drawImage(img, 0, 0, 600, 600);
        setFormData({ ...formData, main_photo: canvas.toDataURL("image/jpeg", 0.6) });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Сохранение
  const handleSave = async () => {
    if (!formData.name || !formData.main_photo) return alert("Имя и Фото!");
    try {
      if (editingId) {
        await updateProduct({ ...formData, id: editingId });
      } else {
        await addProduct(formData);
      }
      
      // МАГИЯ: Заставляем браузер забыть старые данные и скачать новые
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({ title: "Успешно сохранено!" });
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ ...formData, name: "", main_photo: "" });
    } catch (e) {
      toast({ title: "Ошибка сервера", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black">ТОВАРЫ ({products?.length || 0})</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products"] })}>
            <RefreshCw size={16} />
          </Button>
          <Button onClick={() => setIsFormOpen(!isFormOpen)} color="blue">
            {isFormOpen ? "ЗАКРЫТЬ" : "+ ДОБАВИТЬ"}
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card className="p-6 mb-10 border-2 border-blue-500 shadow-xl grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="w-full aspect-square border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 relative">
               {formData.main_photo ? <img src={formData.main_photo} className="w-full h-full object-cover" /> : <Upload className="text-gray-300" />}
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhoto} />
             </div>
             <p className="text-xs text-center text-gray-400">Нажмите на квадрат выше, чтобы загрузить фото</p>
          </div>
          <div className="space-y-4">
             <Input placeholder="Название модели" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             <Input type="number" placeholder="Цена (сом)" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
             <Button className="w-full bg-green-600 h-14 text-lg font-bold" onClick={handleSave}>СОХРАНИТЬ В БАЗУ</Button>
          </div>
        </Card>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <Input className="pl-10" placeholder="Поиск по названию..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {isLoading ? <Loader2 className="animate-spin mx-auto mt-20" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {products?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
            <div key={p.id} className="border rounded-2xl p-2 bg-white shadow-sm hover:shadow-md transition-all">
              <img src={p.main_photo} className="w-full aspect-square object-cover rounded-xl mb-2" />
              <p className="font-bold text-[11px] truncate uppercase">{p.name}</p>
              <p className="text-blue-600 font-black text-sm">{p.price} сом</p>
              <div className="flex gap-2 mt-2">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { setEditingId(p.id); setFormData(p); setIsFormOpen(true); window.scrollTo(0,0); }}><Edit size={14}/></Button>
                <Button size="icon" variant="outline" className="h-8 w-8 text-red-500" onClick={() => confirm('Удалить?') && deleteProduct(p.id)}><Trash2 size={14}/></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
      }
