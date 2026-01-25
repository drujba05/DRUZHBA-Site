import { useProducts, Product } from "@/lib/products";
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Package, Save, X, ImageIcon, Palette, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: products, addProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  // Функция для конвертации файла в строку (Base64)
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
    };
    reader.readAsDataURL(file);
  };

  const removeAdditionalPhoto = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      additional_photos: prev.additional_photos.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.main_photo) {
      toast({ title: "Ошибка", description: "Заполните название и загрузите главное фото", variant: "destructive" });
      return;
    }
    try {
      await addProduct(newProduct);
      toast({ title: "Успех", description: "Товар добавлен!" });
      setIsAdding(false);
      // Сброс формы
      setNewProduct({
        name: "", sku: "", category: "Кроссовки", description: "", price: 0,
        sizes: "36-41", colors: "", status: "В наличии", min_order_quantity: 6,
        pairs_per_box: 6, main_photo: "", additional_photos: [], is_bestseller: false, is_new: true
      });
    } catch (e) {
      toast({ title: "Ошибка", description: "Не удалось сохранить в базу", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto p-4 pt-10 pb-20 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" /> АДМИН-ПАНЕЛЬ
          </h1>
          <p className="text-sm text-gray-500">Управление товарами и складом</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"} className="rounded-xl font-bold">
          {isAdding ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {isAdding ? "ОТМЕНА" : "ДОБАВИТЬ"}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-10 border-none shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-slate-900 p-4 text-white font-bold text-center uppercase tracking-widest">
            Карточка нового товара
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* СЕКЦИЯ ФОТО */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2 text-blue-700">
                  <Upload size={16} /> ГЛАВНОЕ ФОТО (обложка)
                </Label>
                <div className="relative group aspect-square max-w-[200px] border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50 hover:border-blue-400 transition-colors">
                  {newProduct.main_photo ? (
                    <img src={newProduct.main_photo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="mx-auto text-gray-400 mb-2" />
                      <span className="text-[10px] text-gray-400 font-medium">НАЖМИТЕ ЧТОБЫ ВЫБРАТЬ</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, true)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-blue-700">ДОПОЛНИТЕЛЬНЫЕ ФОТО</Label>
                <div className="grid grid-cols-4 gap-2">
                  {newProduct.additional_photos.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => removeAdditionalPhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white p-1"><X size={10}/></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100">
                    <Plus className="text-gray-400" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                  </label>
                </div>
              </div>
            </div>

            {/* СЕКЦИЯ ДАННЫХ */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[12px]">Название модели</Label>
                <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Напр: Nike Air Max" className="h-12 border-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[12px]">Цена за пару (сом)</Label>
                  <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="h-12 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[12px]">Пар в коробке</Label>
                  <Input type="number" value={newProduct.pairs_per_box} onChange={e => setNewProduct({...newProduct, pairs_per_box: Number(e.target.value), min_order_quantity: Number(e.target.value)})} className="h-12 border-gray-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2 uppercase text-[12px]"><Palette size={14} /> Цвета через запятую</Label>
                <Input value={newProduct.colors} onChange={e => setNewProduct({...newProduct, colors: e.target.value})} placeholder="Белый, Черный, Синий" className="h-12 border-gray-200" />
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase text-[12px]">Статус</Label>
                <Select onValueChange={(v: any) => setNewProduct({...newProduct, status: v})} defaultValue={newProduct.status}>
                  <SelectTrigger className="h-12 border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="В наличии">В НАЛИЧИИ</SelectItem>
                    <SelectItem value="Нет в наличии">НЕТ В НАЛИЧИИ</SelectItem>
                    <SelectItem value="Ожидается поступление">ОЖИДАЕТСЯ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase text-[12px]">Описание / Материал</Label>
                <Textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Описание товара..." className="border-gray-200" />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg cursor-pointer border border-orange-100">
                  <Checkbox checked={newProduct.is_bestseller} onCheckedChange={(v) => setNewProduct({...newProduct, is_bestseller: !!v})} />
                  <span className="text-[10px] font-black text-orange-700">ХИТ ПРОДАЖ 🔥</span>
                </label>
                <label className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg cursor-pointer border border-green-100">
                  <Checkbox checked={newProduct.is_new} onCheckedChange={(v) => setNewProduct({...newProduct, is_new: !!v})} />
                  <span className="text-[10px] font-black text-green-700">НОВИНКА ✨</span>
                </label>
              </div>
            </div>

            <Button onClick={handleAddProduct} disabled={isUploading} className="md:col-span-2 w-full h-14 bg-blue-700 hover:bg-blue-800 text-white font-black text-xl rounded-2xl shadow-xl transition-transform active:scale-95">
              {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              СОХРАНИТЬ ТОВАР В КАТАЛОГ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* СПИСОК ТОВАРОВ */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {(products || []).map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 relative">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border">
              <img src={product.main_photo} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-sm text-slate-900 truncate uppercase">{product.name}</h3>
              <p className="text-blue-600 font-black text-base">{product.price} сом</p>
              <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">
                {product.status} • {product.pairs_per_box} пар в кор.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-gray-300 hover:text-red-600"
              onClick={() => { if(confirm('Удалить этот товар?')) deleteProduct(product.id) }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
             }
