import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, X, ImagePlus, Loader2, Search, Edit3, CloudSun, Box, Ruler } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

// Схема данных (Zod)
const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  category: z.string().default("Обувь"),
  price: z.coerce.number().min(1, "Укажите цену"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.string().default("В наличии"),
  season: z.string().min(1, "Выберите сезон"),
  min_order_quantity: z.coerce.number().min(1),
  pairs_per_box: z.coerce.number().min(1),
  is_bestseller: z.boolean().optional().default(false),
  is_new: z.boolean().optional().default(true),
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
      status: "В наличии", season: "Демисезон", min_order_quantity: 6, pairs_per_box: 6, 
      is_bestseller: false, is_new: true,
    },
  });

  // Загрузка нескольких файлов сразу
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
      toast({ title: `Загружено фото: ${paths.length}` });
    } catch (err) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (editingId) {
      const p = products.find((item: any) => item.id === editingId);
      if (p) {
        form.reset({ ...p, price: Number(p.price) });
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (previews.length === 0) return toast({ title: "Добавьте фото", variant: "destructive" });
    
    const data = { 
      ...values, 
      main_photo: previews[0], 
      additional_photos: previews.slice(1) 
    };
    
    if (editingId) await onUpdateProduct(editingId, data);
    else await onAddProduct(data);
    
    form.reset();
    setPreviews([]);
    setEditingId(null);
    toast({ title: "Сохранено успешно!" });
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50/50 min-h-screen pb-20">
      
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <div className="bg-slate-900 p-4 text-white text-center text-[10px] font-black uppercase tracking-[0.2em]">
          {editingId ? "📝 Редактирование товара" : "➕ Новый товар в каталог"}
        </div>
        
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* БЛОК ФОТО (Мультизагрузка) */}
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Фотографии товара</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group">
                      <img src={src} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12}/>
                      </button>
                      {i === 0 && <div className="absolute bottom-0 w-full bg-blue-600 text-[8px] text-white font-bold text-center py-1">ГЛАВНОЕ</div>}
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 hover:border-blue-400 transition-all group">
                    {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : <ImagePlus className="text-slate-300 group-hover:text-blue-500" size={28} />}
                    <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Добавить</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
              </div>

              {/* ПОЛЯ ФОРМЫ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Название модели</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>
                )} />
                <FormField control={form.control} name="colors" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Цвета (через запятую)</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Цена / пара</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>
                )} />
                <FormField control={form.control} name="season" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Сезон</FormLabel>
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
                <FormField control={form.control} name="sizes" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Размеры</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>
                )} />
                <FormField control={form.control} name="pairs_per_box" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">В коробке</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>
                )} />
              </div>

              <Button type="submit" disabled={isUploading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-100">
                {isUploading ? "Загружаем файлы..." : editingId ? "Обновить товар" : "Опубликовать товар"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* СПИСОК С ПОИСКОМ */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Быстрый поиск по названию..." className="h-14 pl-12 rounded-[1.5rem] border-none shadow-sm bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="grid gap-3">
          {filteredProducts.map((p: any) => (
            <div key={p.id} className="bg-white p-3 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-slate-50 group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4">
                <img src={p.main_photo} className="w-14 h-14 object-cover rounded-xl" />
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase text-slate-700">{p.name}</span>
                  <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                    <span className="text-blue-600">{p.price} сом</span>
                    <span>{p.season}</span>
                    <span>{p.pairs_per_box} пар</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pr-2">
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600" onClick={() => {setEditingId(p.id); window.scrollTo({top: 0, behavior: 'smooth'})}}><Edit3 size={16}/></Button>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-red-50 text-red-400" onClick={() => onDeleteProduct(p.id)}><Trash2 size={16}/></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
    }
