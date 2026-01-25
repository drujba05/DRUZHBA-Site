import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Импорт xlsx временно убран для успешного деплоя
// import * as XLSX from "xlsx"; 
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Pencil, Trash2, X, ShieldCheck, ImagePlus, Loader2, Search, Flame, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  sku: z.string().optional(),
  category: z.string().min(2, "Обязательное поле"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  season: z.enum(["Зима", "Лето", "Демисезон", "Все сезоны"]),
  gender: z.enum(["Универсальные", "Женские", "Мужские", "Детские"]),
  min_order_quantity: z.coerce.number().min(1, "Минимум 1 пара"),
  pairs_per_box: z.coerce.number().min(1, "Минимум 1 пара").optional(),
  comment: z.string().optional(),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => Promise<Product>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export function AdminPanel({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }: AdminPanelProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "Обувь", price: 0, sizes: "36-41", colors: "",
      status: "В наличии", season: "Все сезоны", gender: "Универсальные",
      min_order_quantity: 6, pairs_per_box: 12, is_bestseller: false, is_new: false,
    },
  });

  useEffect(() => {
    if (editingId) {
      const product = products.find(p => p.id === editingId);
      if (product) {
        form.reset({
          name: product.name, sku: product.sku, category: product.category,
          price: product.price, sizes: product.sizes, colors: product.colors,
          status: product.status as any,
          season: (product.season as any) || "Все сезоны",
          gender: (product.gender as any) || "Универсальные",
          min_order_quantity: product.min_order_quantity,
          pairs_per_box: product.pairs_per_box || 12,
          is_bestseller: !!product.is_bestseller,
          is_new: !!product.is_new,
        });
        setPreviews([product.main_photo, ...product.additional_photos].filter(Boolean));
      }
    }
  }, [editingId, products]);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({ 
      title: "Функция временно отключена", 
      description: "Нужно установить библиотеку xlsx через терминал.",
      variant: "destructive"
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const result = await uploadFile(file);
        if (result) uploadedUrls.push(result.objectPath);
      }
      if (uploadedUrls.length > 0) setPreviews(prev => [...prev, ...uploadedUrls]);
    } finally {
      setIsUploadingImages(false);
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const main_photo = previews[0] || "";
    const additional_photos = previews.slice(1);
    try {
      if (editingId) {
        await onUpdateProduct(editingId, { ...values, main_photo, additional_photos });
        toast({ title: "Обновлено" });
        setEditingId(null);
      } else {
        await onAddProduct({ ...values, main_photo, additional_photos });
        toast({ title: "Добавлено" });
      }
      form.reset();
      setPreviews([]);
    } catch (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full border-t-4 border-t-blue-600 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">{editingId ? "✏️ Редактирование" : "➕ Новый товар"}</CardTitle>
              <CardDescription>Заполните параметры модели</CardDescription>
            </div>
            {editingId && (
              <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Название</FormLabel><Input {...field} placeholder="Напр: Сапоги EVA" /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Категория</FormLabel><Input {...field} /></FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Цена (сом)</FormLabel><Input type="number" {...field} /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="season" render={({ field }) => (
                    <FormItem><FormLabel>Сезон</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Все сезоны">Все сезоны</SelectItem>
                          <SelectItem value="Зима">Зима</SelectItem>
                          <SelectItem value="Лето">Лето</SelectItem>
                          <SelectItem value="Демисезон">Демисезон</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="colors" render={({ field }) => (
                    <FormItem><FormLabel>Цвета</FormLabel><Input placeholder="Черный, синий..." {...field} /></FormItem>
                  )} />
                </div>

                <div className="flex gap-6 p-4 bg-slate-50 rounded-lg border">
                  <FormField control={form.control} name="is_bestseller" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="flex items-center gap-1 cursor-pointer font-medium text-sm">
                        <Flame className="h-4 w-4 text-orange-500" /> Хит
                      </FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="is_new" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="flex items-center gap-1 cursor-pointer font-medium text-sm">
                        <Sparkles className="h-4 w-4 text-green-500" /> New
                      </FormLabel>
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-2">
                  <Label>Фотографии</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden border group">
                        <img src={src} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                        {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-blue-600/80 text-[8px] text-white text-center py-0.5 font-bold uppercase">Главное</div>}
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all">
                      {isUploadingImages ? <Loader2 className="animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                      <span className="text-[10px] mt-1 font-medium">{isUploadingImages ? 'Загрузка' : 'Добавить'}</span>
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold uppercase shadow-md active:scale-[0.98] transition-transform">
                  {editingId ? "Сохранить правки" : "Добавить в базу"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="h-full bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><FileSpreadsheet size={120} /></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-blue-400 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Excel Импорт</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Массовая загрузка каталога</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer group">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-500 mb-3 group-hover:text-blue-400 transition-colors" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-300">Выбрать файл Excel</p>
              <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" onChange={handleExcelImport} />
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h4 className="font-bold text-blue-400 text-xs mb-3 flex items-center uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 mr-2" /> Памятка по формату
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                Колонки в файле: Название, Цена, Категория, Размеры, Цвета, Сезон, Коробка, Фото (ссылка)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Управление товарами</CardTitle>
              <CardDescription>Всего позиций в базе: {filteredProducts.length}</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Поиск модели..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 border-slate-200 focus:ring-blue-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/50 text-slate-600 uppercase text-[10px] font-bold border-b">
                <tr>
                  <th className="p-4 text-left">Товар</th>
                  <th className="p-4 text-left">Категория</th>
                  <th className="p-4 text-left">Цена</th>
                  <th className="p-4 text-left">Сезон</th>
                  <th className="p-4 text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.main_photo} className="w-10 h-10 object-cover rounded border bg-white shadow-sm" />
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{p.name}</div>
                          <div className="text-[10px] text-slate-400 tracking-wider uppercase">{p.sku || 'Без артикула'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{p.category}</td>
                    <td className="p-4 font-black text-blue-600">{p.price} сом</td>
                    <td className="p-4 italic text-slate-500 text-xs">{p.season || "Все сезоны"}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => { setEditingId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="h-8 w-8 p-0 text-blue-600 border-blue-100 hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="outline" size="sm" onClick={() => { if(confirm(`Удалить ${p.name}?`)) onDeleteProduct(p.id) }} className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 border-rose-100"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="p-20 text-center text-slate-400 text-sm italic">Товары не найдены</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
      }
