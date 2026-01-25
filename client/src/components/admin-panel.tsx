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
import { Pencil, Trash2, X, ImagePlus, Loader2, Search, Flame, Sparkles, Package, CheckCircle2, Clock, Ban, Palette } from "lucide-react";
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
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 bg-white">
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="border-t-4 border-t-blue-600 shadow-lg sticky top-6">
            <CardHeader><CardTitle>{editingId ? "📝 Правка" : "➕ Новый товар"}</CardTitle></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Название</FormLabel><Input {...field} /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Описание</FormLabel><Textarea placeholder="Опишите модель..." {...field} className="min-h-[60px]" /></FormItem>
                  )} />
                  <FormField control={form.control} name="colors" render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center gap-1"><Palette size={14} className="text-blue-500"/> Цвета</FormLabel><Input placeholder="Черный, Синий" {...field} /></FormItem>
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
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Статус</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="В наличии">✅ В наличии</SelectItem>
                            <SelectItem value="Ожидается поступление">⏳ Ожидается</SelectItem>
                            <SelectItem value="Нет в наличии">❌ Нет в наличии</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="min_order_quantity" render={({ field }) => (
                      <FormItem><FormLabel>Мин. заказ (пар)</FormLabel><Input type="number" {...field} /></FormItem>
                    )} />
                  </div>
                  <div className="flex gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <FormField control={form.control} name="is_bestseller" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="cursor-pointer font-bold flex items-center gap-1"><Flame size={14} className="text-orange-500"/> ХИТ</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="is_new" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="cursor-pointer font-bold flex items-center gap-1"><Sparkles size={14} className="text-green-600"/> NEW</FormLabel>
                      </FormItem>
                    )} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-slate-400">Фотографии</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square border-2 rounded-lg overflow-hidden group">
                          <img src={src} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 bg-slate-50 transition-all">
                        {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus size={24} />}
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                  </div>
                  <Button type="submit" className="w-full h-14 text-lg font-black uppercase bg-blue-600 hover:bg-blue-700 shadow-md">
                    {editingId ? "Сохранить изменения" : "Опубликовать"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-7">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-white border-b py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold uppercase flex items-center gap-2"><Package className="text-blue-600" /> База товаров</CardTitle>
              <Input placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-48 md:w-64 h-9" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 border-b">
                    <tr>
                      <th className="p-4 text-left">Товар</th>
                      <th className="p-4 text-center">Инфо</th>
                      <th className="p-4 text-left">Цена</th>
                      <th className="p-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-blue-50/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.main_photo} className="w-11 h-11 rounded-md object-cover border" />
                            <div className="font-bold text-slate-800">{p.name}</div>
                          </div>
                        </td>
                        <td className="p-4 text-center text-[11px]">
                          <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1 ${
                            p.status === "В наличии" ? "bg-green-100 text-green-700" :
                            p.status === "Ожидается поступление" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          }`}>
                            {p.status}
                          </div>
                          <div className="font-bold text-slate-500 uppercase">{p.sizes}</div>
                        </td>
                        <td className="p-4 font-black text-blue-600">{p.price} сом</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-9 px-3 border-blue-200 text-blue-600 font-bold text-[10px] hover:bg-blue-600 hover:text-white" onClick={() => {setEditingId(
