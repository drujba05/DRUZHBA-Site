import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, X, ImagePlus, Loader2, Search, Pencil, ArrowLeft, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";
import { Link } from "wouter";

// Схема данных
const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  category: z.string().default("Обувь"),
  price: z.coerce.number().min(1, "Укажите цену"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.string().default("В наличии"),
  season: z.string().min(1, "Выберите сезон"),
  pairs_per_box: z.coerce.number().min(1),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

export function AdminPanel({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }: any) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Фильтрация для поиска
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Обработка загрузки нескольких фото
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

  // Заполнение формы при редактировании
  useEffect(() => {
    if (editingId) {
      const p = products.find((item: any) => item.id === editingId);
      if (p) {
        form.reset({ ...p, price: Number(p.price) });
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
        setIsFormOpen(true);
      }
    }
  }, [editingId, products]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (previews.length === 0) return toast({ title: "Добавьте хотя бы одно фото", variant: "destructive" });
    const data = { ...values, main_photo: previews[0], additional_photos: previews.slice(1) };
    
    if (editingId) await onUpdateProduct(editingId, data);
    else await onAddProduct(data);
    
    form.reset();
    setPreviews([]);
    setEditingId(null);
    setIsFormOpen(false);
    toast({ title: "Успешно сохранено!" });
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 bg-white min-h-screen">
      
      {/* ВЕРХНЯЯ ЧАСТЬ КАК НА СКРИНШОТЕ */}
      <div className="border-[1.5px] border-slate-200 rounded-[2.5rem] p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center px-2">
          <Link href="/">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm cursor-pointer">
              <ArrowLeft size={18} /> НА САЙТ
            </div>
          </Link>
          <div className="flex items-center gap-2 text-slate-900 font-black text-xl uppercase tracking-tight">
            <Package className="text-blue-600" size={24} /> КАТАЛОГ
          </div>
        </div>

        <Button 
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (editingId) { setEditingId(null); form.reset(); setPreviews([]); }
          }}
          className="w-full h-14 bg-[#0f172a] hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-transform active:scale-95"
        >
          {isFormOpen ? "ЗАКРЫТЬ ФОРМУ" : "+ ДОБАВИТЬ ТОВАР"}
        </Button>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <Input 
            placeholder="Поиск по названию..." 
            className="h-14 pl-12 rounded-[1.2rem] border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ФОРМА (ВСЕ ПОЛЯ) */}
      {isFormOpen && (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* МУЛЬТИЗАГРУЗКА ФОТО */}
                <div className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 ml-1">Фотографии</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                        <img src={src} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50">
                      {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : <ImagePlus className="text-slate-300" />}
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                </div>

                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase ml-1">Название модели</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase ml-1">Цена (сом)</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />
                  <FormField control={form.control} name="season" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black text-slate-400 uppercase ml-1">Сезон</FormLabel>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sizes" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase ml-1">Размеры</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />
                  <FormField control={form.control} name="pairs_per_box" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase ml-1">Пар в коробе</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />
                </div>

                <FormField control={form.control} name="colors" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase ml-1">Цвета</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />

                <Button type="submit" disabled={isUploading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase rounded-2xl shadow-xl shadow-blue-100">
                  {editingId ? "ОБНОВИТЬ" : "СОХРАНИТЬ В КАТАЛОГ"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* СПИСОК ТОВАРОВ */}
      <div className="space-y-3">
        {filteredProducts.map((p: any) => (
          <div key={p.id} className="bg-white p-4 rounded-[1.8rem] flex items-center justify-between shadow-sm border border-slate-50">
            <div className="flex items-center gap-4">
              <img src={p.main_photo} className="w-14 h-14 object-cover rounded-2xl shadow-sm" />
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase text-slate-800 leading-tight">{p.name}</span>
                <span className="text-[10px] font-bold text-blue-600">{p.price} сом — {p.season}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl" onClick={() => setEditingId(p.id)}><Pencil size={16}/></Button>
              <Button size="icon" variant="ghost" className="h-10 w-10 bg-red-50 text-red-400 rounded-xl" onClick={() => { if(confirm('Удалить?')) onDeleteProduct(p.id)}}><Trash2 size={16}/></Button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Package size={64} className="mx-auto mb-4" />
            <h2 className="text-lg font-black uppercase tracking-tighter">Ничего не найдено</h2>
          </div>
        )}
      </div>
    </div>
  );
    }
