import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Pencil, Trash2, X, ImagePlus, Loader2, Search, Flame, Sparkles, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  category: z.string().min(2, "Обязательное поле"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Цена > 0"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  season: z.enum(["Зима", "Лето", "Демисезон", "Все сезоны"]),
  gender: z.enum(["Универсальные", "Женские", "Мужские", "Детские"]),
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
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", category: "Обувь", description: "", price: 0, sizes: "36-41", colors: "",
      status: "В наличии", season: "Все сезоны", gender: "Универсальные",
      min_order_quantity: 6, pairs_per_box: 12, is_bestseller: false, is_new: false,
    },
  });

  useEffect(() => {
    if (editingId) {
      const product = products.find((p: any) => p.id === editingId);
      if (product) {
        form.reset({
          ...product,
          price: Number(product.price),
          pairs_per_box: product.pairs_per_box || 12,
        });
        setPreviews([product.main_photo, ...product.additional_photos].filter(Boolean));
      }
    }
  }, [editingId, products]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of files) {
        const result = await uploadFile(file);
        if (result) setPreviews(prev => [...prev, result.objectPath]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const main_photo = previews[0] || "";
    const additional_photos = previews.slice(1);
    try {
      if (editingId) {
        await onUpdateProduct(editingId, { ...values, main_photo, additional_photos });
        toast({ title: "Обновлено успешно" });
        setEditingId(null);
      } else {
        await onAddProduct({ ...values, main_photo, additional_photos });
        toast({ title: "Товар добавлен" });
      }
      form.reset();
      setPreviews([]);
    } catch (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* ФОРМА (ЛЕВАЯ ЧАСТЬ) */}
        <div className="lg:col-span-5">
          <Card className="border-t-4 border-t-blue-600 shadow-xl sticky top-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{editingId ? "📝 Редактирование" : "➕ Добавить модель"}</span>
                {editingId && <Button variant="ghost" size="sm" onClick={() => {setEditingId(null); form.reset(); setPreviews([]);}}><X size={18}/></Button>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Название товара</FormLabel><Input {...field} placeholder="Напр: Кроссовки Bona" /></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Описание</FormLabel><Textarea placeholder="Материал, особенности..." {...field} className="min-h-[80px]" /></FormItem>
                  )} />

                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem><FormLabel>Цена</FormLabel><Input type="number" {...field} /></FormItem>
                    )} />
                    <FormField control={form.control} name="sizes" render={({ field }) => (
                      <FormItem><FormLabel>Размеры</FormLabel><Input placeholder="36-41" {...field} /></FormItem>
                    )} />
                    <FormField control={form.control} name="pairs_per_box" render={({ field }) => (
                      <FormItem><FormLabel>В коробке</FormLabel><Input type="number" {...field} /></FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="colors" render={({ field }) => (
                      <FormItem><FormLabel>Цвета</FormLabel><Input placeholder="Черный, синий" {...field} /></FormItem>
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

                  <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border">
                    <FormField control={form.control} name="is_bestseller" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="flex items-center gap-1 cursor-pointer"><Flame className="w-4 h-4 text-orange-500" /> Хит</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="is_new" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="flex items-center gap-1 cursor-pointer"><Sparkles className="w-4 h-4 text-green-500" /> New</FormLabel>
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Фотографии (Мультизагрузка)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square border-2 rounded-lg overflow-hidden group">
                          <img src={src} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                          {i === 0 && <div className="absolute bottom-0 w-full bg-blue-600 text-[8px] text-white text-center py-0.5 font-bold">ГЛАВНОЕ</div>}
                        </div>
                      ))}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 bg-slate-50 transition-colors">
                        {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus size={24} />}
                        <span className="text-[10px] mt-1 font-bold">ФОТО</span>
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                  </div>

                  <Button type="submit" className="w-full h-14 text-lg font-black uppercase shadow-lg active:scale-95 transition-transform bg-blue-600 hover:bg-blue-700">
                    {editingId ? "Сохранить изменения" : "Опубликовать товар"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* СПИСОК (ПРАВАЯ ЧАСТЬ) */}
        <div className="lg:col-span-7">
          <Card className="shadow-2xl border-none">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl py-6 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <Package className="text-blue-400" />
                <CardTitle className="text-xl">Каталог товаров</CardTitle>
              </div>
              <div className="relative w-48 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input placeholder="Быстрый поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b">
                    <tr>
                      <th className="p-4 text-left">Модель</th>
                      <th className="p-4 text-center">Размеры / Короба</th>
                      <th className="p-4 text-left">Цена</th>
                      <th className="p-4 text-right">Управление</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img src={p.main_photo} className="w-12 h-12 rounded-lg object-cover border shadow-sm bg-white" />
                              {p.is_new && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 leading-none mb-1">{p.name}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest">{p.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="font-mono text-xs font-bold text-slate-600 bg-slate-100 inline-block px-2 py-1 rounded">{p.sizes}</div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase">В коробке: {p.pairs_per_box} шт</div>
                        </td>
                        <td className="p-4 whitespace-nowrap font-black text-blue-600 text-base">{p.price} сом</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-9 px-3 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm" onClick={() => {setEditingId(p.id); window.scrollTo({top: 0, behavior: 'smooth'});}}>
                              <Pencil size={16} className="mr-1.5" /> <span className="text-xs font-bold">ПРАВКА</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-2 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm" onClick={() => {if(confirm(`Удалить ${p.name}?`)) onDeleteProduct(p.id)}}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="py-20 text-center text-slate-400 italic">Товары не найдены</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
    }
