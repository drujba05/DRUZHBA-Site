import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, X, ImagePlus, Loader2, Sparkles, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2, "Введите название"),
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
        toast({ title: "Обновлено!" });
      } else {
        await onAddProduct({ ...values, ...photos });
        toast({ title: "Добавлено в каталог!" });
      }
      form.reset();
      setPreviews([]);
    } catch (e) {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-8">
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-blue-600 text-white rounded-t-xl">
            <CardTitle>{editingId ? "📝 Редактировать товар" : "📦 Добавить товар"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Название модели</FormLabel><Input placeholder="Напр: Кроссовки Bona" {...field} /></FormItem>
                )} />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Цена (сом)</FormLabel><Input type="number" {...field} /></FormItem>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="colors" render={({ field }) => (
                    <FormItem><FormLabel>Цвета (через запятую)</FormLabel><Input placeholder="Черный, Белый" {...field} /></FormItem>
                  )} />
                  <FormField control={form.control} name="pairs_per_box" render={({ field }) => (
                    <FormItem><FormLabel>Пар в коробке</FormLabel><Input type="number" {...field} /></FormItem>
                  )} />
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                   <FormField control={form.control} name="is_new" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="flex items-center gap-1 font-bold"><Sparkles className="w-4 h-4 text-orange-500"/> Новинка</FormLabel>
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-2">
                  <FormLabel>Фотографии</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((url, i) => (
                      <div key={url} className="relative aspect-square border rounded-lg overflow-hidden group">
                        <img src={url} className="object-cover w-full h-full" />
                        <button type="button" onClick={() => setPreviews(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                      {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                </div>

                <Button type="submit" className="w-full bg-blue-600 h-12 font-bold uppercase shadow-md active:scale-95 transition-transform">
                  {editingId ? "Сохранить изменения" : "Опубликовать на сайт"}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" onClick={() => {setEditingId(null); form.reset(); setPreviews([]);}} className="w-full text-slate-500">
                    Отменить редактирование
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="border-none shadow-lg sticky top-24">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Список товаров ({products?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
            {products && products.length > 0 ? (
              <div className="divide-y">
                {products.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={p.main_photo} className="w-10 h-10 object-cover rounded border" />
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate w-32">{p.name}</p>
                        <p className="text-[10px] text-blue-600 font-bold uppercase">{p.price} сом</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="h-8 w-8 text-blue-600 hover:bg-blue-50"><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => {if(confirm("Удалить этот товар?")) onDeleteProduct(p.id)}} className="h-8 w-8 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 text-sm">
                Товаров пока нет
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  }
