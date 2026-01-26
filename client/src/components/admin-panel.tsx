import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2, Search, Flame, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  category: z.string().min(2),
  price: z.coerce.number().min(1),
  sizes: z.string().min(1),
  colors: z.string().min(1),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  season: z.enum(["Зима", "Лето", "Все сезоны"]),
  gender: z.enum(["Универсальные", "Женские", "Мужские", "Детские"]),
  min_order_quantity: z.coerce.number().min(1),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: any) => Promise<any>;
  onUpdateProduct: (id: string | number, product: any) => Promise<any>;
  onDeleteProduct: (id: string | number) => Promise<void>;
}

export function AdminPanel({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminPanelProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<any>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "Обувь", price: 0,
      sizes: "36-41", colors: "Черный", status: "В наличии",
      season: "Все сезоны", gender: "Универсальные", min_order_quantity: 6,
      is_bestseller: false, is_new: true,
    },
  });

  useEffect(() => {
    if (editingId) {
      const p = products.find(i => i.id == editingId);
      if (p) {
        form.reset(p as any);
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products]);

  const onFile = async (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    setUploading(true);
    try {
      for (const f of files) {
        const res = await uploadFile(f);
        if (res) setPreviews(prev => [...prev, res.objectPath]);
      }
    } finally { setUploading(false); }
  };

  async function onSubmit(vals: any) {
    try {
      const data = { ...vals, main_photo: previews[0] || "", additional_photos: previews.slice(1) };
      if (editingId) await onUpdateProduct(editingId, data);
      else await onAddProduct(data);
      setEditingId(null); setPreviews([]); form.reset();
      toast({ title: "Успешно" });
    } catch (e) { toast({ title: "Ошибка", variant: "destructive" }); }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {editingId ? <Pencil size={18}/> : <Plus size={18}/>} {editingId ? "Изменить" : "Добавить"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="name" render={({field}) => (
                <FormItem><FormLabel>Название</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>
              )}/>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="price" render={({field}) => (
                  <FormItem><FormLabel>Цена</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>
                )}/>
                <FormField control={form.control} name="category" render={({field}) => (
                  <FormItem><FormLabel>Категория</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>
                )}/>
              </div>
              <div className="space-y-2">
                <Label>Фото ({previews.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {previews.map((s, i) => (
                    <div key={i} className="relative w-16 h-16 border rounded overflow-hidden">
                      <img src={s} className="w-full h-full object-cover"/>
                      <X size={12} className="absolute top-0 right-0 bg-red-500 text-white cursor-pointer" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}/>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="w-16 h-16" onClick={() => fileRef.current?.click()}>
                    {uploading ? <Loader2 className="animate-spin"/> : <ImagePlus size={20}/>}
                  </Button>
                </div>
                <input type="file" ref={fileRef} className="hidden" multiple onChange={onFile}/>
              </div>
              <Button type="submit" className="w-full bg-blue-600">{editingId ? "Сохранить" : "Создать"}</Button>
              {editingId && <Button type="button" variant="ghost" className="w-full" onClick={() => {setEditingId(null); setPreviews([]); form.reset();}}>Отмена</Button>}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-slate-400" size={16}/>
            <Input placeholder="Поиск..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-auto space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
              <div className="flex items-center gap-3">
                <img src={p.main_photo} className="w-10 h-10 object-cover rounded"/>
                <div>
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-blue-600">{p.price} сом</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setEditingId(p.id)}><Pencil size={14}/></Button>
                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => confirm("Удалить?") && onDeleteProduct(p.id)}><Trash2 size={14}/></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
