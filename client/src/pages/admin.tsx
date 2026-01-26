import { useProducts, Product } from "@/lib/products";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Package, Save, Upload, Loader2, ArrowLeft, Lock, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    sku: "",
    category: "Кроссовки",
    description: "",
    price: 0,
    sizes: "36-41",
    colors: "",
    status: "В наличии",
    season: "Лето", 
    min_order_quantity: 6,
    pairs_per_box: 12,
    main_photo: "",
    additional_photos: [],
    is_bestseller: false,
    is_new: true
  });

  // Функция сжатия фото (чтобы не было ошибок сервера)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Ограничиваем размер для стабильности
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("canvas-2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // Сжимаем до 70% качества
        setFormData(prev => ({ ...prev, main_photo: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = () => {
    if (password.trim() === "Medina050891") {
      setIsAuthenticated(true);
      toast({ title: "Вход выполнен" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.main_photo) {
      toast({ title: "Заполните поля", description: "Нужно название и фото", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        await updateProduct({ ...formData, id: editingId });
        toast({ title: "Товар обновлен" });
      } else {
        await addProduct(formData);
        toast({ title: "Товар добавлен" });
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ ...formData, name: "", main_photo: "", description: "" });
    } catch (e) {
      console.error(e);
      toast({ title: "Ошибка сервера", description: "Попробуйте фото поменьше", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] p-4">
        <Card className="w-full max-w-sm p-8">
          <div className="flex flex-col items-center space-y-4">
            <Lock className="h-12 w-12 text-blue-600 mb-2" />
            <h2 className="text-xl font-bold uppercase">Вход в админку</h2>
            <Input 
              type="password" 
              placeholder="Введите пароль" 
              className="text-center h-12"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full h-12 bg-blue-600">ВОЙТИ</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl pb-20">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4"/> Сайт</Button></Link>
          <h1 className="font-bold text-lg uppercase tracking-tight">Управление</h1>
        </div>
        <Button onClick={() => {
          setIsFormOpen(!isFormOpen);
          if (!isFormOpen) { setEditingId(null); setFormData({...formData, name: "", main_photo: ""}); }
        }} variant={isFormOpen ? "outline" : "default"} className="font-bold">
          {isFormOpen ? "ОТМЕНА" : "+ ДОБАВИТЬ ТОВАР"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-8 p-6 border-2 border-blue-500/20 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="font-bold">Главное фото (обязательно)</Label>
              <div className="aspect-square w-full max-w-[200px] border-2 border-dashed rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden relative">
                {formData.main_photo ? (
                  <img src={formData.main_photo} className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-gray-300" />
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
              </div>
              <p className="text-[10px] text-gray-400">Нажмите на квадрат, чтобы выбрать фото</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Цена (сом)</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Размеры</Label>
                  <Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Сезон</Label>
                <Select onValueChange={v => setFormData({...formData, season: v})} value={formData.season}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Лето">Лето</SelectItem>
                    <SelectItem value="Зима">Зима</SelectItem>
                    <SelectItem value="Демисезон">Демисезон</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-green-600 hover:bg-green-700 font-bold text-lg">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
                {editingId ? "СОХРАНИТЬ ИЗМЕНЕНИЯ" : "СОЗДАТЬ ТОВАР"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Поиск по названию..." 
          className="pl-10 h-10 rounded-xl" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto h-10 w-10 text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
            <div key={p.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100">
                <img src={p.main_photo} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-xs truncate uppercase mb-1">{p.name}</h3>
                <p className="text-blue-600 font-black text-sm mb-3">{p.price} сом</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                    setEditingId(p.id);
                    setFormData(p);
                    setIsFormOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}><Edit size={14} /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={() => {
                    if (confirm('Удалить товар?')) deleteProduct(p.id);
                  }}><Trash2 size={14} /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
        }
