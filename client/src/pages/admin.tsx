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
  Palette, Upload, Loader2, ArrowLeft, Lock, Ruler 
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
    const cleanInput = password.trim();
    // Принимаем оба варианта (с пробелом и без), чтобы не было ошибок
    if (cleanInput === "Medina050891" || cleanInput === "Medina 050891") {
      setIsAuthenticated(true);
      toast({ title: "Доступ разрешен", description: "Добро пожаловать!" });
    } else {
      toast({ 
        title: "Ошибка", 
        description: "Неверный пароль. Проверьте заглавные буквы.", 
        variant: "destructive" 
      });
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
      toast({ title: "Фото готово" });
    };
    reader.readAsDataURL(file);
  };

  // СОХРАНЕНИЕ ТОВАРА
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.main_photo) {
      toast({ title: "Ошибка", description: "Заполните название и загрузите фото", variant: "destructive" });
      return;
    }
    try {
      await addProduct(newProduct);
      toast({ title: "Успех!", description: "Товар добавлен в каталог" });
      setIsAdding(false);
      setNewProduct({
        name: "", sku: "", category: "Кроссовки", description: "", price: 0,
        sizes: "36-41", colors: "", status: "В наличии", min_order_quantity: 6,
        pairs_per_box: 6, main_photo: "", additional_photos: [], is_bestseller: false, is_new: true
      });
    } catch (e) {
      toast({ title: "Ошибка", description: "Не удалось сохранить", variant: "destructive" });
    }
  };

  // 1. ЭКРАН ВХОДА
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] px-4">
        <Card className="w-full max-w-sm p-8 shadow-2xl border-none">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <Lock className="text-white h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase">Вход в Админку</h1>
            <Input 
              type="password" 
              placeholder="Введите пароль" 
              className="h-12 text-center text-lg border-2 focus:border-blue-500"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold">
              ВОЙТИ
            </Button>
            <Link href="/" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              <ArrowLeft size={14} /> На сайт
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="container mx-auto p-4 pt-6 pb-24 min-h-screen bg-gray-50">
      
      {/* ШАПКА АДМИНКИ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="rounded-xl gap-2 font-bold text-slate-600">
              <ArrowLeft size={18} /> НА ГЛАВНУЮ
            </Button>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase">
            <Package className="text-blue-600" /> КАТАЛОГ
          </h1>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          className={`rounded-2xl font-black px-8 h-12 shadow-lg ${isAdding ? 'bg-gray-200 text-slate-700 hover:bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isAdding ? "ОТМЕНИТЬ" : "+ ДОБАВИТЬ ТОВАР"}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-12 border-none shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-[#1e293b] p-4 text-white font-black text-center uppercase tracking-widest text-sm">
            Добавление новой позиции
          </div>
          <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* ФОТО */}
            <div className="space-y-6">
              <div>
                <Label className="font-black text-slate-700 uppercase block mb-3">Главное фото</Label>
                <div className="relative aspect-square max-w-[250px] border-4 border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center overflow-hidden bg-gray-50 hover:border-blue-400 transition-all cursor-pointer">
                  {newProduct.main_photo ? (
                    <img src={newProduct.main_photo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="mx-auto text-gray-300 mb-2 h-8 w-8" />
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Загрузить фото</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div>
                <Label className="font-black text-slate-700 uppercase block mb-3">Дополнительные ракурсы</Label>
                <div className="grid grid-cols-4 gap-3">
                  {newProduct.additional_photos.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => setNewProduct(p => ({...p, additional_photos: p.additional_photos.filter((_, idx) => idx !== i)}))} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg"><X size={10}/></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-100">
                    <Plus className="text-gray-300" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                  </label>
                </div>
              </div>
            </div>

            {/* ПОЛЯ ДАННЫХ */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="font-bold text-[11px] uppercase text-slate-400">Название модели</Label>
                <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Напр: Кеды классические" className="h-12 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold text-[11px] uppercase text-slate-400">Цена (сом)</Label>
                  <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-[11px] uppercase text-slate-400">Пар в коробке</Label>
                  <Input type="number" value={newProduct.pairs_per_box} onChange={e => setNewProduct({...newProduct, pairs_per_box: Number(e.target.value), min_order_quantity: Number(e.target.value)})} className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold text-[11px] uppercase text-slate-400 flex items-center gap-1"><Ruler size={12}/> Размеры</Label>
                  <Input value={newProduct.sizes} onChange={e => setNewProduct({...newProduct, sizes: e.target.value})} placeholder="36-41" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-[11px] uppercase text-slate-400 flex items-center gap-1"><Palette size={12}/> Цвета</Label>
                  <Input value={newProduct.colors} onChange={e => setNewProduct({...newProduct, colors: e.target.value})} placeholder="Белый, Черный" className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-bold text-[11px] uppercase text-slate-400">Статус наличия</Label>
                <Select onValueChange={(v: any) => setNewProduct({...newProduct, status: v})} defaultValue={newProduct.status}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="В наличии">В наличии</SelectItem>
                    <SelectItem value="Нет в наличии">Нет в наличии</SelectItem>
                    <SelectItem value="Ожидается поступление">Ожидается</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="font-bold text-[11px] uppercase text-slate-400">Описание</Label>
                <Textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Материал, особенности..." className="rounded-xl min-h-[80px]" />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex-1 flex items-center gap-2 bg-orange-50 p-3 rounded-xl border border-orange-100 cursor-pointer">
                  <Checkbox checked={newProduct.is_bestseller} onCheckedChange={(v) => setNewProduct({...newProduct, is_bestseller: !!v})} />
                  <span className="text-[10px] font-black text-orange-700 uppercase">ХИТ 🔥</span>
                </label>
                <label className="flex-1 flex items-center gap-2 bg-green-50 p-3 rounded-xl border border-green-100 cursor-pointer">
                  <Checkbox checked={newProduct.is_new} onCheckedChange={(v) => setNewProduct({...newProduct, is_new: !!v})} />
                  <span className="text-[10px] font-black text-green-700 uppercase">NEW ✨</span>
                </label>
              </div>
            </div>

            <Button 
              onClick={handleAddProduct} 
              disabled={isUploading} 
              className="lg:col-span-2 w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              ОПУБЛИКОВАТЬ ТОВАР
            </Button>
          </CardContent>
        </Card>
      )}

      {/* СПИСОК ТОВАРОВ */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {(products || []).map((product) => (
          <div key={product.id} className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm flex gap-4 relative group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border shrink-0">
              <img src={product.main_photo} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow min-w-0 flex flex-col justify-center">
              <h3 className="font-bold text-[11px] truncate uppercase text-slate-800">{product.name}</h3>
              <p className="text-blue-600 font-black text-sm leading-none mt-1">{product.price} сом</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{product.sizes}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-1 right-1 h-7 w-7 text-gray-200 hover:text-red-500"
              onClick={() => { if(confirm('Удалить?')) deleteProduct(product.id) }}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
        }
