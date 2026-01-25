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
  Palette, Upload, Loader2, ArrowLeft, Lock, Ruler, ExternalLink 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: products, addProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  
  // СОСТОЯНИЯ АВТОРИЗАЦИИ И ИНТЕРФЕЙСА
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // СОСТОЯНИЕ ДЛЯ НОВОГО ТОВАРА
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    sku: "",
    category: "Кроссовки",
    description: "",
    price: 0,
    sizes: "36-41",
    colors: "",
    status: "В наличии",
    min_order_quantity: 6,
    pairs_per_box: 6,
    main_photo: "",
    additional_photos: [],
    is_bestseller: false,
    is_new: true
  });

  // ФУНКЦИЯ ВХОДА (Пароль: Medina050891)
  const handleLogin = () => {
    if (password === "Medina 050891") {
      setIsAuthenticated(true);
      toast({ title: "Доступ разрешен", description: "Добро пожаловать в панель управления" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль администратора", variant: "destructive" });
    }
  };

  // ЗАГРУЗКА ФОТО И КОНВЕРТАЦИЯ В BASE64
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isMain) {
        setNewProduct(prev => ({ ...prev, main_photo: base64String }));
      } else {
        setNewProduct(prev => ({ 
          ...prev, 
          additional_photos: [...prev.additional_photos, base64String] 
        }));
      }
      setIsUploading(false);
      toast({ title: "Фото загружено" });
    };
    reader.readAsDataURL(file);
  };

  // СОХРАНЕНИЕ ТОВАРА
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.main_photo) {
      toast({ title: "Ошибка", description: "Укажите название и загрузите главное фото", variant: "destructive" });
      return;
    }
    try {
      await addProduct(newProduct);
      toast({ title: "Готово!", description: "Товар успешно добавлен в каталог" });
      setIsAdding(false);
      setNewProduct({
        name: "", sku: "", category: "Кроссовки", description: "", price: 0,
        sizes: "36-41", colors: "", status: "В наличии", min_order_quantity: 6,
        pairs_per_box: 6, main_photo: "", additional_photos: [], is_bestseller: false, is_new: true
      });
    } catch (e) {
      toast({ title: "Ошибка", description: "Не удалось сохранить товар", variant: "destructive" });
    }
  };

  // 1. ЭКРАН ВХОДА
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] px-4">
        <Card className="w-full max-w-sm p-8 shadow-2xl border-none">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
              <Lock className="text-white h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Вход в Админку</h1>
              <p className="text-sm text-slate-500 font-medium">Введите пароль администратора</p>
            </div>
            <Input 
              type="password" 
              placeholder="Пароль" 
              className="h-12 text-center text-lg"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-lg">
              ВОЙТИ
            </Button>
            <Link href="/" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
              <ArrowLeft size={14} /> Вернуться на главную
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 2. ЗАГРУЗКА ДАННЫХ
  if (isLoading) return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 bg-gray-50">
      <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      <p className="font-bold text-slate-600">Загружаем базу товаров...</p>
    </div>
  );

  // 3. ОСНОВНОЙ ИНТЕРФЕЙС
  return (
    <div className="container mx-auto p-4 pt-6 pb-24 min-h-screen bg-gray-50">
      
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="rounded-xl gap-2 font-bold text-slate-600 hover:bg-gray-100">
              <ArrowLeft size={18} /> НА ГЛАВНУЮ
            </Button>
          </Link>
          <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
            <Package className="text-blue-600" /> КАТАЛОГ
          </h1>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          variant={isAdding ? "outline" : "default"} 
          className={`rounded-2xl font-black px-8 h-12 transition-all shadow-lg ${!isAdding && 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
        >
          {isAdding ? <X size={20} /> : <Plus size={20} className="mr-2" />}
          {isAdding ? "ОТМЕНИТЬ" : "ДОБАВИТЬ ТОВАР"}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-12 border-none shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-[#1e293b] p-5 text-white font-black text-center uppercase tracking-widest text-sm">
            Заполнение данных о товаре
          </div>
          <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* ФОТО ТОВАРА */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-black text-slate-700 uppercase flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-600" /> Главное изображение
                </Label>
                <div className="relative aspect-square max-w-[280px] mx-auto lg:mx-0 border-4 border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center overflow-hidden bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                  {newProduct.main_photo ? (
                    <img src={newProduct.main_photo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center">
                      <Upload className="text-gray-300 mb-3 h-10 w-10 group-hover:text-blue-400" />
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Нажмите для загрузки</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-black text-slate-700 uppercase">Дополнительные фото</Label>
                <div className="grid grid-cols-4 gap-3">
                  {newProduct.additional_photos.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setNewProduct(p => ({...p, additional_photos: p.additional_photos.filter((_, idx) => idx !== i)}))} 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 hover:bg-red-600 shadow-md"
                      >
                        <X size={12}/>
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <Plus className="text-gray-300" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                  </label>
                </div>
              </div>
            </div>

            {/* ХАРАКТЕРИСТИКИ */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-slate-500">Название модели</Label>
                <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Напр: Nike Air Force 1" className="h-12 rounded-xl border-gray-200 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-slate-500">Цена (сом)</Label>
                  <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-slate-500">В коробке (пар)</Label>
                  <Input type="number" value={newProduct.pairs_per_box} onChange={e => setNewProduct({...newProduct, pairs_per_box: Number(e.target.value), min_order_quantity: Number(e.target.value)})} className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-slate-500 flex items-center gap-1"><Ruler size={14}/> Размеры</Label>
                  <Input value={newProduct.sizes} onChange={e => setNewProduct({...newProduct, sizes: e.target.value})} placeholder="36-41" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-slate-500 flex items-center gap-1"><Palette size={14}/> Цвета</Label>
                  <Input value={newProduct.colors} onChange={e => setNewProduct({...newProduct, colors: e.target.value})} placeholder="Черный, Белый" className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-slate-500">Наличие</Label>
                <Select onValueChange={(v: any) => setNewProduct({...newProduct, status: v})} defaultValue={newProduct.status}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="В наличии">✅ В НАЛИЧИИ</SelectItem>
                    <SelectItem value="Нет в наличии">❌ НЕТ В НАЛИЧИИ</SelectItem>
                    <SelectItem value="Ожидается поступление">⏳ ОЖИДАЕТСЯ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-slate-500">Материалы и описание</Label>
                <Textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Напр: Натуральная кожа, подкладка байка..." className="rounded-xl border-gray-200 min-h-[100px]" />
              </div>

              <div className="flex gap-4 pt-4">
                <label className="flex-1 flex items-center justify-center gap-3 bg-orange-50 hover:bg-orange-100 p-4 rounded-2xl border border-orange-200 cursor-pointer transition-colors group">
                  <Checkbox checked={newProduct.is_bestseller} onCheckedChange={(v) => setNewProduct({...newProduct, is_bestseller: !!v})} className="h-5 w-5 border-orange-400 data-[state=checked]:bg-orange-500" />
                  <span className="text-sm font-black text-orange-700 uppercase group-hover:scale-105 transition-transform">ХИТ ПРОДАЖ 🔥</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-3 bg-green-50 hover:bg-green-100 p-4 rounded-2xl border border-green-200 cursor-pointer transition-colors group">
                  <Checkbox checked={newProduct.is_new} onCheckedChange={(v) => setNewProduct({...newProduct, is_new: !!v})} className="h-5 w-5 border-green-400 data-[state=checked]:bg-green-500" />
                  <span className="text-sm font-black text-green-700 uppercase group-hover:scale-105 transition-transform">НОВИНКА ✨</span>
                </label>
              </div>
            </div>

            <Button 
              onClick={handleAddProduct} 
              disabled={isUploading} 
              className="lg:col-span-2 w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {isUploading ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3 h-6 w-6" />}
              СОХРАНИТЬ ТОВАР В КАТАЛОГ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* СПИСОК ТОВАРОВ В БАЗЕ */}
      <div className="flex items-center gap-4 mb-6 px-2">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Все товары в базе</h2>
        <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          {products?.length || 0} шт.
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(products || []).map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex gap-4 relative group hover:shadow-lg transition-all border-l-4 border-l-blue-500">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              <img src={product.main_photo} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow min-w-0 flex flex-col justify-center">
              <h3 className="font-bold text-xs text-slate-900 truncate uppercase mb-1">{product.name}</h3>
              <p className="text-blue-600 font-black text-lg leading-none mb-2">{product.price} <span className="text-[10px]">сом</span></p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
                   <Ruler size={10} /> {product.sizes}
                </span>
                <span className="text-[9px] font-bold text-blue-400 uppercase">
                  {product.pairs_per_box} ПАР
                </span>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg"
                onClick={() => { if(confirm('Удалить этот товар из каталога?')) deleteProduct(product.id) }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
      }
