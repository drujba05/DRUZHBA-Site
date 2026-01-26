import { useProducts, Product } from "@/lib/products";
import { useState, ChangeEvent } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Trash2, Plus, Package, Save, X, 
  Palette, Upload, Loader2, ArrowLeft, Lock, Ruler, Edit, CloudSun, Search, ShieldCheck, Flame, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  
  // СОСТОЯНИЯ АВТОРИЗАЦИИ
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // СОСТОЯНИЯ ИНТЕРФЕЙСА
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // СОСТОЯНИЕ МАССОВОГО ИЗМЕНЕНИЯ ЦЕН
  const [bulkAction, setBulkAction] = useState({
    type: "percent" as "percent" | "fixed",
    value: 0,
    direction: "increase" as "increase" | "decrease"
  });

  const initialFormState: Omit<Product, "id"> = {
    name: "",
    sku: "",
    category: "Кроссовки",
    description: "",
    price: 0,
    sizes: "36-41",
    colors: "",
    status: "В наличии",
    season: "Демисезон", 
    min_order_quantity: 6,
    pairs_per_box: 6,
    main_photo: "",
    additional_photos: [],
    is_bestseller: false,
    is_new: true
  };

  const [formData, setFormData] = useState<Omit<Product, "id">>(initialFormState);

  // ФИЛЬТРАЦИЯ ДЛЯ ПОИСКА И МАССОВЫХ ДЕЙСТВИЙ
  const filteredProducts = (products || []).filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.season.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ЛОГИКА ВХОДА
  const handleLogin = () => {
    const cleanInput = password.trim();
    if (cleanInput === "Medina050891" || cleanInput === "Medina 050891") {
      setIsAuthenticated(true);
      toast({ title: "Доступ разрешен" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    }
  };

  // ЛОГИКА МАССОВОГО ИЗМЕНЕНИЯ ЦЕН
  const handleBulkPriceUpdate = async () => {
    if (bulkAction.value <= 0) return;
    const count = filteredProducts.length;
    if (!confirm(`Вы действительно хотите изменить цены у ${count} товаров?`)) return;

    try {
      for (const product of filteredProducts) {
        let newPrice = product.price;
        const val = Number(bulkAction.value);
        if (bulkAction.type === "percent") {
          const diff = (product.price * val) / 100;
          newPrice = bulkAction.direction === "increase" ? product.price + diff : product.price - diff;
        } else {
          newPrice = bulkAction.direction === "increase" ? product.price + val : product.price - val;
        }
        // Обновляем каждый товар в базе
        await updateProduct({ ...product, price: Math.round(newPrice) });
      }
      toast({ title: "Готово!", description: `Цены обновлены у ${count} товаров` });
      setBulkAction({ ...bulkAction, value: 0 });
    } catch (e) {
      toast({ title: "Ошибка", description: "Не удалось обновить цены", variant: "destructive" });
    }
  };

  // ЗАГРУЗКА ФОТО (Base64)
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isMain) setFormData(prev => ({ ...prev, main_photo: base64String }));
      else setFormData(prev => ({ ...prev, additional_photos: [...prev.additional_photos, base64String] }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // СОХРАНЕНИЕ ТОВАРА
  const handleSave = async () => {
    if (!formData.name || !formData.main_photo) {
      toast({ title: "Ошибка", description: "Название и главное фото обязательны", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await updateProduct({ ...formData, id: editingId });
        toast({ title: "Товар обновлен" });
      } else {
        await addProduct(formData);
        toast({ title: "Товар добавлен в базу" });
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
    } catch (e) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  };

  // ЭКРАН ЛОГИНА
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] px-4">
        <Card className="w-full max-w-sm p-8 shadow-2xl border-none rounded-[2.5rem]">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-500/30">
              <Lock className="text-white h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Вход в систему</h1>
            <Input 
              type="password" 
              placeholder="Пароль администратора" 
              className="h-14 text-center text-xl rounded-2xl border-2"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg">ВОЙТИ</Button>
            <Link href="/" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
              <ArrowLeft size={14} /> Вернуться в магазин
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;

  return (
    <div className="container mx-auto p-4 pt-6 pb-24 min-h-screen bg-gray-50">
      
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ (ВЕРХ) */}
      <div className="flex flex-col gap-6 mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost" className="font-bold rounded-xl"><ArrowLeft size={18} className="mr-2"/> НА САЙТ</Button></Link>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2"><Package className="text-blue-600"/> СКЛАД</h1>
          </div>
          <Button 
            onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(initialFormState); }} 
            className={`rounded-2xl font-black px-8 h-12 transition-all ${isFormOpen ? "bg-red-500" : "bg-slate-900 shadow-xl shadow-slate-200"}`}
          >
            {isFormOpen ? "ЗАКРЫТЬ ОКНО" : "+ НОВЫЙ ТОВАР"}
          </Button>
        </div>

        {/* ПОИСК */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Поиск по названию, артикулу или сезону..." 
            className="h-14 pl-12 rounded-2xl border-none bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* МАССОВОЕ ИЗМЕНЕНИЕ ЦЕН (ИНСТРУМЕНТ) */}
      <Card className="mb-8 border-blue-100 bg-blue-50/40 rounded-[2rem] p-6 shadow-none">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full flex items-center gap-2 text-blue-700 font-black uppercase text-xs tracking-widest">
            <ShieldCheck size={18}/> Групповая коррекция цен ({filteredProducts.length} тов.)
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <Select value={bulkAction.direction} onValueChange={(v: any) => setBulkAction({...bulkAction, direction: v})}>
              <SelectTrigger className="w-48 h-12 bg-white rounded-xl font-bold border-none shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Увеличить на</SelectItem>
                <SelectItem value="decrease">Уменьшить на</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex h-12 shadow-sm rounded-xl overflow-hidden">
              <Input 
                type="number" 
                className="w-24 border-none h-full bg-white rounded-none text-center font-bold" 
                value={bulkAction.value} 
                onChange={e => setBulkAction({...bulkAction, value: Number(e.target.value)})} 
              />
              <Select value={bulkAction.type} onValueChange={(v: any) => setBulkAction({...bulkAction, type: v})}>
                <SelectTrigger className="w-20 border-none h-full bg-slate-100 rounded-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">%</SelectItem>
                  <SelectItem value="fixed">сом</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleBulkPriceUpdate} className="bg-blue-600 hover:bg-blue-700 h-12 px-10 rounded-xl font-black uppercase shadow-lg shadow-blue-200">
              ОБНОВИТЬ ЦЕНЫ
            </Button>
          </div>
        </div>
      </Card>

      {/* ФОРМА (РЕДАКТИРОВАНИЕ / ДОБАВЛЕНИЕ) */}
      {isFormOpen && (
        <Card className="mb-12 border-none shadow-2xl rounded-[3rem] overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900 p-4 text-white font-black text-center uppercase tracking-widest text-sm">
            {editingId ? "✍️ Режим редактирования" : "✨ Карточка нового товара"}
          </div>
          <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* ФОТО */}
            <div className="space-y-8">
              <div>
                <Label className="font-black text-slate-800 uppercase mb-4 block text-xs">Главное изображение</Label>
                <div className="relative aspect-square max-w-[300px] border-4 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center overflow-hidden bg-slate-50 hover:border-blue-400 transition-all group">
                  {formData.main_photo ? <img src={formData.main_photo} className="w-full h-full object-cover" /> : <Upload className="text-slate-300 h-12 w-12" />}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div>
                <Label className="font-black text-slate-800 uppercase mb-4 block text-xs">Галерея дополнительных фото</Label>
                <div className="grid grid-cols-4 gap-4">
                  {formData.additional_photos.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border shadow-sm">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => setFormData(p => ({...p, additional_photos: p.additional_photos.filter((_, idx) => idx !== i)}))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg"><X size={12}/></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors text-slate-400">
                    <Plus size={24} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                  </label>
                </div>
              </div>
            </div>

            {/* ДАННЫЕ */}
            <div className="space-y-5">
              <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Название модели</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Цена за пару (сом)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>
                <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Кол-во в коробе</Label><Input type="number" value={formData.pairs_per_box} onChange={e => setFormData({...formData, pairs_per_box: Number(e.target.value)})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-400">Сезон</Label>
                  <Select onValueChange={(v) => setFormData({...formData, season: v})} value={formData.season}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Лето">☀️ ЛЕТО</SelectItem>
                      <SelectItem value="Зима">❄️ ЗИМА</SelectItem>
                      <SelectItem value="Демисезон">🍂 ДЕМИСЕЗОН</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Цвета</Label><Input value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} placeholder="Черный, Синий..." className="h-12 rounded-xl bg-slate-50 border-none" /></div>
              </div>

              <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Размерная сетка</Label><Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="36-41" className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>

              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-3 bg-orange-50 p-4 rounded-2xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors">
                  <Checkbox checked={formData.is_bestseller} onCheckedChange={(v) => setFormData({...formData, is_bestseller: !!v})} />
                  <span className="text-xs font-black text-orange-700 uppercase flex items-center gap-1"><Flame size={14}/> ХИТ</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                  <Checkbox checked={formData.is_new} onCheckedChange={(v) => setFormData({...formData, is_new: !!v})} />
                  <span className="text-xs font-black text-blue-700 uppercase flex items-center gap-1"><Sparkles size={14}/> NEW</span>
                </label>
              </div>

              <Button onClick={handleSave} disabled={isUploading} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-200 mt-4">
                {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                {editingId ? "ОБНОВИТЬ ТОВАР" : "СОЗДАТЬ И ВЫЛОЖИТЬ"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* СПИСОК ТОВАРОВ В ВИДЕ СЕТКИ */}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group relative">
            <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-3 relative">
              <img src={product.main_photo} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_bestseller && <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">ХИТ</span>}
                {product.is_new && <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">NEW</span>}
              </div>
            </div>
            
            <div className="px-1 flex-grow">
              <h3 className="font-black text-[11px] truncate uppercase text-slate-800 leading-tight mb-1">{product.name}</h3>
              <p className="text-blue-600 font-black text-sm">{product.price} сом</p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{product.season}</span>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 bg-blue-50 rounded-lg" onClick={() => { setEditingId(product.id); setFormData(product); setIsFormOpen(true); window.scrollTo({top:0, behavior:'smooth'}); }}><Edit size={14}/></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600 bg-red-50 rounded-lg" onClick={() => { if(confirm('Удалить товар навсегда?')) deleteProduct(product.id) }}><Trash2 size={14} /></Button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <Package className="mx-auto h-16 w-16 text-slate-100 mb-4" />
          <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Склад пуст или ничего не найдено</h3>
        </div>
      )}
    </div>
  );
}
