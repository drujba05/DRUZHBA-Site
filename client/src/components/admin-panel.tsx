import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, X, ImagePlus, Loader2, FileSpreadsheet, Flame, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  category: z.string().min(2),
  price: z.coerce.number().min(1),
  sizes: z.string().min(1),
  colors: z.string().min(1),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  season: z.enum(["Зима", "Лето", "Демисезон", "Все сезоны"]),
  gender: z.enum(["Универсальные", "Женские", "Мужские", "Детские"]),
  min_order_quantity: z.coerce.number().min(1),
  pairs_per_box: z.coerce.number().min(1).optional(),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

export function AdminPanel({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: any) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", category: "Обувь", price: 0, sizes: "36-41", colors: "Черный",
      status: "В наличии", season: "Все сезоны", gender: "Универсальные",
      min_order_quantity: 6, pairs_per_box: 12, is_bestseller: false, is_new: false,
    },
  });

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset({
      name: product.name, price: product.price, category: product.category,
      sizes: product.sizes, colors: product.colors, status: product.status as any,
      season: (product.season as any) || "Все сезоны",
      gender: (product.gender as any) || "Универсальные",
      pairs_per_box: product.pairs_per_box, min_order_quantity: product.min_order_quantity,
      is_bestseller: product.is_bestseller, is_new: product.is_new,
    });
    setPreviews([product.main_photo, ...product.additional_photos].filter(Boolean));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcelUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt: any) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      
      toast({ title: "Начинаю импорт...", description: `Загрузка ${data.length} товаров` });
      
      for (const row of data as any[]) {
        await onAddProduct({
          name: row.Название || "Без названия",
          price: Number(row.Цена) || 0,
          category: row.Категория || "Обувь",
          sizes: String(row.Размеры || "36-41"),
          colors: String(row.Цвета || "Черный"),
          status: "В наличии",
          season: row.Сезон || "Все сезоны",
          gender: row.Пол || "Универсальные",
          pairs_per_box: Number(row.Коробка) || 12,
          min_order_quantity: Number(row.МинЗаказ) || 6,
          main_photo: row.Фото || "",
          additional_photos: [],
          is_new: true
        });
      }
      toast({ title: "Excel импортирован!" });
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = async (e: any) => {
    const files = Array.from(e.target.files || []);
    setIsUploading(true);
    for (const file of files) {
      const result = await uploadFile(file as File);
      if (result) setPreviews(prev => [...prev, result.objectPath]);
    }
    setIsUploading(false);
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const photos = { main_photo: previews[0] || "", additional_photos: previews.slice(1) };
    try {
      if (editingId) {
        await onUpdateProduct(editingId, { ...values, ...photos });
        setEditingId(null);
        toast({ title: "Обновлено успешно" });
      } else {
        await onAddProduct({ ...values, ...photos });
        toast({ title: "Товар добавлен" });
      }
      form.reset();
      setPreviews([]);
    } catch (e) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-8">
        {/* ФОРМА */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl">
            <CardTitle>{editingId ? "✏️ Редактирование" : "➕ Новый товар"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Название</FormLabel><Input {...field} /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Цена</FormLabel><Input type="number" {...field} /></FormItem>
                  )} />
                  <FormField control={form.control} name="season" render={({ field }) => (
                    <FormItem><FormLabel>Сезон</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Лето">Лето</SelectItem>
                          <SelectItem value="Зима">Зима</SelectItem>
                          <SelectItem value="Демисезон">Демисезон</SelectItem>
                          <SelectItem value="Все сезоны">Все сезоны</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                   <FormField control={form.control} name="is_new" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-green-500"/> Новинка</FormLabel>
                    </FormItem>
                  )} />
                </div>
                <div className="space-y-2">
                  <FormLabel>Фотографии (Первое — главное)</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((url, i) => (
                      <div key={i} className="relative aspect-square border rounded-lg overflow-hidden group">
                        <img src={url} className="object-cover w-full h-full" />
                        <button type="button" onClick={() => setPreviews(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-500">
                      {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 h-12 font-bold uppercase">{editingId ? "Сохранить изменения" : "Добавить в каталог"}</Button>
                {editingId && <Button type="button" variant="ghost" onClick={() => {setEditingId(null); form.reset(); setPreviews([]);}} className="w-full">Отмена</Button>}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* СПИСОК ТОВАРОВ */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b"><CardTitle>Управление товарами ({products?.length || 0})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {products?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={p.main_photo} className="w-12 h-12 object-cover rounded-lg border" />
                    <div>
                      <p className="font-bold text-slate-900 leading-none mb-1">{p.name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">{p.price} сом • {p.season}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => startEdit(p)} className="text-blue-600 border-blue-100 hover:bg-blue-50"><Pencil size={16} /></Button>
                    <Button size="icon" variant="outline" onClick={() => {if(confirm("Удалить?")) onDeleteProduct(p.id)}} className="text-rose-500 border-rose-100 hover:bg-rose-50"><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-green-600 text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSpreadsheet /> EXCEL ИМПОРТ</CardTitle>
            <CardDescription className="text-green-100">Массовая загрузка товаров</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white/10 p-4 rounded-lg border border-white/20 mb-4">
              <p className="text-[10px] uppercase font-bold mb-2">Названия колонок:</p>
              <p className="text-[10px]">Название, Цена, Категория, Размеры, Цвета, Сезон, Пол, Коробка, МинЗаказ, Фото</p>
            </div>
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-green-700 hover:file:bg-green-50" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
  }
