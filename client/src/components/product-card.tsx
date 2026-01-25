import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, X, ImagePlus, Loader2, Edit2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  category: z.string().default("Обувь"),
  price: z.coerce.number().min(1, "Цена обязательна"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", category: "Обувь", price: 0, sizes: "36-41", colors: "",
      status: "В наличии", min_order_quantity: 6, pairs_per_box: 12, is_bestseller: false, is_new: false,
    },
  });

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
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      const paths = [];
      for (const f of files) {
        const res = await uploadFile(f);
        if (res?.objectPath) paths.push(res.objectPath);
      }
      setPreviews(prev => [...prev, ...paths]);
    } catch (error) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (previews.length === 0) {
      toast({ title: "Ошибка", description: "Нужно хотя бы одно фото", variant: "destructive" });
      return;
    }
    
    const data = { 
      ...values, 
      main_photo: previews[0], 
      additional_photos: previews.slice(1) 
    };

    try {
      if (editingId) {
        await onUpdateProduct(editingId, data);
        toast({ title: "Обновлено успешно" });
      } else {
        await onAddProduct(data);
        toast({ title: "Товар добавлен" });
      }
      form.reset();
      setPreviews([]);
      setEditingId(null);
    } catch (err) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen">
      <Card className="border-2 border-blue-100 shadow-xl">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-lg uppercase font-black italic">
            {editingId ? "📝 Редактирование товара" : "🚀 Добавить новинку"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Секция фото */}
              <div className="grid grid-cols-4 gap-3">
                {previews.map((s, i) => (
                  <div key={i} className="relative aspect-square border-2 border-slate-200 rounded-lg overflow-hidden group">
                    <img src={s} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="text-white w-6 h-6" />
                    </button>
                    {i === 0 && <span className="absolute bottom-0 w-full bg-blue-600 text-[8px] text-white text-center font-bold">ГЛАВНОЕ</span>}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors"
                >
                  {isUploading ? <Loader2 className="animate-spin text-blue-600" /> : <><ImagePlus className="text-slate-400 mb-1" /> <span className="text-[10px] font-bold text-slate-400">ФОТО</span></>}
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase">Название модели</FormLabel><FormControl><Input placeholder="Напр: Кроссовки Nike Air" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="colors" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase">Цвета в наличии</FormLabel><FormControl><Input placeholder="Черный, Белый, Синий" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase">Цена (сом)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="sizes" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase">Размеры</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="min_order_quantity" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase">Мин. заказ</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="pairs_per_box" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase">В коробке</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isUploading} className="flex-grow h-12 bg-blue-600 hover:bg-blue-700 font-black">
                  {isUploading ? "ЗАГРУЗКА..." : editingId ? "ОБНОВИТЬ ТОВАР" : "ОПУБЛИКОВАТЬ"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(); setPreviews([]); }} className="h-12">ОТМЕНА</Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Список товаров для управления */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Управление товарами ({products.length})</h3>
        <div className="grid gap-2">
          {products.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-4">
                <img src={p.main_photo} className="w-12 h-12 object-cover rounded-lg border" />
                <div>
                  <p className="font-bold text-sm text-slate-800">{p.name}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase">{p.price} сом — {p.colors}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => { setEditingId(p.id); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                  <Edit2 size={18} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onDeleteProduct(p.id)} className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
    }
