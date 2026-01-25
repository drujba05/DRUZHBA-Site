import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, X, ImagePlus, Loader2, Search, Edit3, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

// Схема данных (соответствует твоим требованиям по полям)
const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  category: z.string().default("Обувь"),
  price: z.coerce.number().min(1, "Укажите цену"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.string().default("В наличии"),
  season: z.string().min(1, "Выберите сезон"),
  pairs_per_box: z.coerce.number().min(1, "Минимум 1 пара"),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

export function AdminPanel({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }: any) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", category: "Обувь", price: 0, sizes: "36-41", colors: "",
      status: "В наличии", season: "Демисезон", pairs_per_box: 6,
    },
  });

  // Фильтрация списка для быстрого поиска товаров
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Заполнение формы данными при нажатии на кнопку редактирования
  useEffect(() => {
    if (editingId) {
      const p = products.find((item: any) => item.id === editingId);
      if (p) {
        form.reset({ ...p, price: Number(p.price) });
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products, form]);

  // Загрузка нескольких фотографий сразу
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const paths = [];
      for (const f of files) {
        const res = await uploadFile(f);
        if (res?.objectPath) paths.push(res.objectPath);
      }
      setPreviews(prev => [...prev, ...paths]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (previews.length === 0) return toast({ title: "Добавьте хотя бы одно фото", variant: "destructive" });
    
    // Первое фото — главное, остальные — дополнительные
    const data = { ...values, main_photo: previews[0], additional_photos: previews.slice(1) };
    
    try {
      if (editingId) await onUpdateProduct(editingId, data);
      else await onAddProduct(data);
      
      form.reset();
      setPreviews([]);
      setEditingId(null);
      toast({ title: "Товар успешно сохранен!" });
    } catch (e) {
      toast({ title: "Ошибка при сохранении", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      
      {/* ФОРМА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ */}
      <Card className="rounded-[2rem] border shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl font-black uppercase flex items-center gap-2">
            <Package className="text-blue-600" /> 
            {editingId ? "Редактирование товара" : "Добавить новый товар"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* ФОТОГРАФИИ */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Фотографии товара (первое - главное)</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-100 group">
                      <img src={src} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10}/>
                      </button>
                      {i === 0 && <div className="absolute bottom-0 w-full bg-blue-600/90 text-[7px] text-white text-center py-0.5 font-black uppercase">Главное</div>}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-all"
                  >
                    {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : <ImagePlus className="text-slate-400" />}
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
              </div>

              {/* ПОЛЯ ВВОДА */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase">Название модели</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:bg-white transition-colors" /></FormItem>} />
                <FormField control={form.control} name="colors" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase">Цвета</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:bg-white transition-colors" /></FormItem>} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase">Цена (сом)</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:bg-white transition-colors" /></FormItem>} />
                <FormField control={form.control} name="season" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase">Сезон</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Лето">Лето</SelectItem>
                        <SelectItem value="Зима">Зима</SelectItem>
                        <SelectItem value="Демисезон">Демисезон</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="sizes" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase">Размеры</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:bg-white transition-colors" /></FormItem>} />
                <FormField control={form.control} name="pairs_per_box" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase">Пар в коробе</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none focus:bg-white transition-colors" /></FormItem>} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isUploading} className="flex-1 h-14 bg-slate-900 hover:bg-black text-white font-black uppercase rounded-2xl shadow-xl active:scale-[0.98] transition-all">
                  {isUploading ? "ЗАГРУЗКА..." : editingId ? "ОБНОВИТЬ ДАННЫЕ" : "СОХРАНИТЬ В КАТАЛОГ"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => {setEditingId(null); form.reset(); setPreviews([]);}} className="h-14 px-8 rounded-2xl font-bold uppercase border-slate-200">Отмена</Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ПОИСК ПО ТОВАРАМ */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            placeholder="Найти товар по названию..." 
            className="h-14 pl-12 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* СПИСОК ТОВАРОВ */}
        <div className="grid gap-2">
          {filteredProducts.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-[1.5rem] shadow-sm border border-slate-50 hover:border-blue-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100">
                  <img src={p.main_photo} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black uppercase text-slate-800 leading-tight">{p.name}</span>
                  <span className="text-[10px] font-bold text-blue-600">{p.price} сом — {p.season}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100" 
                  onClick={() => {setEditingId(p.id); window.scrollTo({top: 0, behavior: 'smooth'});}}
                >
                  <Edit3 size={16}/>
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 bg-red-50 text-red-400 rounded-xl hover:bg-red-100" 
                  onClick={() => {if(confirm(`Удалить ${p.name}?`)) onDeleteProduct(p.id)}}
                >
                  <Trash2 size={16}/>
                </Button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed">
              <Package size={48} className="mx-auto mb-2 text-slate-200" />
              <p className="text-slate-400 font-bold uppercase text-[10px]">Ничего не найдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
    }
