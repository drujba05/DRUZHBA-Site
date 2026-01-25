import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, X, ImagePlus, Loader2, Edit3, Package, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().default("Обувь"),
  price: z.coerce.number().min(1),
  sizes: z.string().min(1),
  colors: z.string().min(1),
  season: z.string().min(1),
  status: z.string().default("В наличии"),
  min_order_quantity: z.coerce.number().min(1),
  pairs_per_box: z.coerce.number().min(1),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

export function AdminPanel({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }: any) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // СОСТОЯНИЕ ДЛЯ ПОИСКА
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", category: "Обувь", price: 0, sizes: "36-41", colors: "",
      status: "В наличии", season: "Демисезон", min_order_quantity: 6, pairs_per_box: 6,
    },
  });

  // ФИЛЬТРАЦИЯ ТОВАРОВ ПО ПОИСКУ
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (editingId) {
      const p = products.find((item: any) => item.id === editingId);
      if (p) {
        form.reset({ ...p, price: Number(p.price) });
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (previews.length === 0) return toast({ title: "Добавьте фото" });
    const data = { ...values, main_photo: previews[0], additional_photos: previews.slice(1) };
    if (editingId) await onUpdateProduct(editingId, data);
    else await onAddProduct(data);
    form.reset();
    setPreviews([]);
    setEditingId(null);
    toast({ title: "Готово!" });
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* ФОРМА ДОБАВЛЕНИЯ */}
      <Card className="rounded-[2rem] border-none shadow-lg bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Package className="text-blue-600" size={20}/> {editingId ? "Редактирование" : "Новый товар"}
          </CardTitle>
          {editingId && <Button variant="ghost" size="sm" className="text-blue-600 font-bold" onClick={() => {setEditingId(null); form.reset(); setPreviews([]);}}>ОТМЕНИТЬ</Button>}
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-4 gap-2">
                {previews.map((s, i) => (
                  <div key={i} className="relative aspect-square border-2 border-slate-50 rounded-2xl overflow-hidden">
                    <img src={s} className="w-full h-full object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 rounded-full" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}><X size={10}/></Button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                  {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : <ImagePlus className="text-slate-400" />}
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-400">Название</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />
                <FormField control={form.control} name="colors" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-400">Цвета</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-400">Цена</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />
                <FormField control={form.control} name="season" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Сезон</FormLabel>
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
                <FormField control={form.control} name="pairs_per_box" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-400">В коробе</FormLabel><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />
              </div>

              <FormField control={form.control} name="sizes" render={({ field }) => <FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-400">Размеры</FormLabel><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none" /></FormItem>} />

              <Button type="submit" disabled={isUploading} className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase rounded-2xl transition-all shadow-lg">
                {isUploading ? "ЗАГРУЗКА..." : editingId ? "ОБНОВИТЬ ТОВАР" : "СОХРАНИТЬ ТОВАР"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* БЛОК ПОИСКА И СПИСКА */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <Input 
            placeholder="Найти товар по названию..." 
            className="h-14 pl-12 rounded-[1.5rem] border-none shadow-sm bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-4">
            {searchQuery ? `Результаты поиска (${filteredProducts.length})` : `Все товары (${products.length})`}
          </h3>
          
          <div className="grid gap-2">
            {filteredProducts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 border-none rounded-[1.5rem] bg-white shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                    <img src={p.main_photo} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase text-slate-800 leading-tight">{p.name}</span>
                    <span className="text-[10px] text-blue-600 font-bold">{p.price} сом — {p.season}</span>
                  </div>
                </div>
                <div className="flex gap-2 pr-1">
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-blue-500 bg-blue-50 rounded-xl" onClick={() => {setEditingId(p.id); window.scrollTo({top: 0, behavior: 'smooth'});}}><Edit3 size={16}/></Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-red-400 hover:bg-red-50 rounded-xl transition-colors" onClick={() => {if(confirm('Удалить товар?')) onDeleteProduct(p.id)}}><Trash2 size={18} /></Button>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Ничего не найдено</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
      }
