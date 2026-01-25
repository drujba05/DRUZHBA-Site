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
  Trash2, Plus, Package, Save, X, ImageIcon, 
  Palette, Upload, Loader2, ArrowLeft, Lock, Ruler, Edit, CloudSun, Search 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  
  // СОСТОЯНИЯ
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // ЛОГИКА ПОИСКА
  const filteredProducts = (products || []).filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.season.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sizes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ВХОД В АДМИНКУ
  const handleLogin = () => {
    const cleanInput = password.trim();
    if (cleanInput === "Medina050891" || cleanInput === "Medina 050891") {
      setIsAuthenticated(true);
      toast({ title: "Вход выполнен успешно" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    }
  };

  // ЗАГРУЗКА КАРТИНОК
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

  // НАЧАЛО РЕДАКТИРОВАНИЯ
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // СОХРАНЕНИЕ / ОБНОВЛЕНИЕ
  const handleSave = async () => {
    if (!formData.name || !formData.main_photo) {
      toast({ title: "Ошибка", description: "Заполните название и загрузите фото", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await updateProduct({ ...formData, id: editingId });
        toast({ title: "Обновлено" });
      } else {
        await addProduct(formData);
        toast({ title: "Товар добавлен" });
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
    } catch (e) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] px-4">
        <Card className="w-full max-w-sm p-8 shadow-2xl border-none">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
              <Lock className="text-white h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Админ-панель</h1>
            <Input 
              type="password" 
              placeholder="Введите пароль" 
              className="h-12 text-center text-lg border-2"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-white">ВОЙТИ</Button>
            <Link href="/" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
              <ArrowLeft size={14} /> На главную
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;

  return (
    <div className="container mx-auto p-4 pt-6 pb-24 min-h-screen bg-gray-50">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div className="flex flex-col gap-6 mb-8 bg-white p-6 rounded-3xl shadow-sm border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost" className="font-bold text-slate-600"><ArrowLeft size={18} className="mr-2"/> НА САЙТ</Button></Link>
            <h1 className="text-2xl font-black uppercase flex items-center gap-2"><Package className="text-blue-600"/> КАТАЛОГ</h1>
          </div>
          <Button onClick={() => { setIsFormOpen(!isFormOpen); if(isFormOpen) { setEditingId(null); setFormData(initialFormState); }}} className="rounded-2xl font-black bg-slate-900 px-8 h-12 text-white">
            {isFormOpen ? "ЗАКРЫТЬ ФОРМУ" : "+ ДОБАВИТЬ ТОВАР"}
          </Button>
        </div>

        {/* ПОИСК */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Поиск по названию, сезону (Лето, Зима, Демисезон) или размеру..." 
            className="h-12 pl-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isFormOpen && (
        <Card className="mb-12 border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-blue-600 p-4 text-white font-bold text-center uppercase tracking-widest text-sm">
            {editingId ? "✍️ Редактирование товара" : "✨ Добавление нового товара"}
          </div>
          <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <Label className="font-black text-slate-700 uppercase mb-4 block">Главное фото</Label>
                <div className="relative aspect-square max-w-[260px] border-4 border-dashed border-gray-200 rounded-[3rem] flex items-center justify-center overflow-hidden bg-gray-50 hover:border-blue-400 transition-all cursor-pointer">
                  {formData.main_photo ? <img src={formData.main_photo} className="w-full h-full object-cover" /> : <Upload className="text-gray-300 h-12 w-12" />}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div>
                <Label className="font-black text-slate-700 uppercase mb-4 block">Доп. фото</Label>
                <div className="grid grid-cols-4 gap-3">
                  {formData.additional_photos.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => setFormData(p => ({...p, additional_photos: p.additional_photos.filter((_, idx) => idx !== i)}))} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-xl"><X size={12}/></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-100">
                    <Plus className="text-gray-400" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Название</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Цена (сом)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="h-12 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Пар в коробе</Label><Input type="number" value={formData.pairs_per_box} onChange={e => setFormData({...formData, pairs_per_box: Number(e.target.value)})} className="h-12 rounded-xl" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1"><CloudSun size={12}/> Сезонность</Label>
                  <Select onValueChange={(v) => setFormData({...formData, season: v})} value={formData.season}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Лето">☀️ ЛЕТО</SelectItem>
                      <SelectItem value="Зима">❄️ ЗИМА</SelectItem>
                      <SelectItem value="Демисезон">🍂 ДЕМИСЕЗОН</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1"><Palette size={12}/> Цвета</Label><Input value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} placeholder="Черный, Синий..." className="h-12 rounded-xl" /></div>
              </div>

              <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1"><Ruler size={12}/> Размеры</Label><Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="36-41" className="h-12 rounded-xl" /></div>

              <div className="space-y-1"><Label className="text-xs uppercase font-bold text-slate-400">Описание</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl min-h-[100px]" /></div>

              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 bg-orange-50 p-4 rounded-2xl border border-orange-100 cursor-pointer">
                  <Checkbox checked={formData.is_bestseller} onCheckedChange={(v) => setFormData({...formData, is_bestseller: !!v})} />
                  <span className="text-xs font-black text-orange-700 uppercase">ХИТ 🔥</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 bg-green-50 p-4 rounded-2xl border border-green-100 cursor-pointer">
                  <Checkbox checked={formData.is_new} onCheckedChange={(v) => setFormData({...formData, is_new: !!v})} />
                  <span className="text-xs font-black text-green-700 uppercase">NEW ✨</span>
                </label>
              </div>

              <Button onClick={handleSave} disabled={isUploading} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-100">
                {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                {editingId ? "СОХРАНИТЬ ИЗМЕНЕНИЯ" : "ОПУБЛИКОВАТЬ ТОВАР"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* СПИСОК ТОВАРОВ */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-[2rem] border shadow-sm hover:shadow-md transition-all flex flex-col group">
            <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden bg-gray-50 border mb-4 relative">
              <img src={product.main_photo} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_bestseller && <span className="bg-orange-500 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg">ХИТ</span>}
                {product.is_new && <span className="bg-green-500 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg">NEW</span>}
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-sm truncate uppercase text-slate-800 mb-1">{product.name}</h3>
              <p className="text-blue-600 font-black text-lg mb-4">{product.price} сом</p>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.season}</span>
                  <span className="text-[10px] text-slate-400 font-medium italic">{product.sizes}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl" onClick={() => startEdit(product)}><Edit size={16}/></Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => { if(confirm('Удалить этот товар?')) deleteProduct(product.id) }}><Trash2 size={16} /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Package className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-400 uppercase">Ничего не найдено</h3>
        </div>
      )}
    </div>
  );
        }
