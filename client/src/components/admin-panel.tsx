import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2, Search, Flame, Sparkles, ShieldCheck } from "lucide-react";
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
  season: z.enum(["Зима", "Лето", "Демисезон", "Все сезоны"]),
  gender: z.enum(["Универсальные", "Женские", "Мужские", "Детские"]),
  min_order_quantity: z.coerce.number().min(1),
  pairs_per_box: z.string().optional(),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

export function AdminPanel({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: any) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<any>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  const [bulkAction, setBulkAction] = useState({ type: "percent", value: 0, direction: "increase" });

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "Обувь", price: 0, sizes: "36-41", colors: "Черный",
      status: "В наличии", season: "Все сезоны", gender: "Универсальные",
      min_order_quantity: 6, pairs_per_box: "", is_bestseller: false, is_new: true,
    },
  });

  useEffect(() => {
    if (editingId) {
      const p = products.find((i: any) => i.id == editingId);
      if (p) {
        form.reset(p);
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
      toast({ title: "Сохранено" });
    } catch (e) { toast({ title: "Ошибка", variant: "destructive" }); }
  }

  const handleBulkUpdate = async () => {
    if (bulkAction.value <= 0) return;
    const filtered = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (!confirm(`Обновить цены для ${filtered.length} товаров?`)) return;
    try {
      for (const p of filtered) {
        let newPrice = p.price;
        const val = Number(bulkAction.value);
        if (bulkAction.type === "percent") {
          const diff = (p.price * val) / 100;
          newPrice = bulkAction.direction === "increase" ? p.price + diff : p.price - diff;
        } else {
          newPrice = bulkAction.direction === "increase" ? p.price + val : p.price - val;
        }
        await onUpdateProduct(p.id, { price: Math.round(newPrice) });
      }
      toast({ title: "Цены обновлены" });
    } catch (e) { toast({ title: "Ошибка", variant: "destructive" }); }
  };

  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2">{editingId ? <Pencil size={18}/> : <Plus size={18}/>} Товар</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({field}) => (
                  <FormItem><FormLabel>Название</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({field}) => (
                    <FormItem><FormLabel>Цена (пара)</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>
                  )}/>
                  <FormField control={form.control} name="pairs_per_box" render={({field}) => (
                    <FormItem><FormLabel>В коробе (инфо)</FormLabel><FormControl><Input placeholder="12 пар" {...field}/></FormControl></FormItem>
                  )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sizes" render={({field}) => (
                    <FormItem><FormLabel>Размеры</FormLabel><FormControl><Input placeholder="36-41" {...field}/></FormControl></FormItem>
                  )}/>
                  <FormField control={form.control} name="colors" render={({field}) => (
                    <FormItem><FormLabel>Цвета</FormLabel><FormControl><Input placeholder="Черный, Синий" {...field}/></FormControl></FormItem>
                  )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="season" render={({field}) => (
                    <FormItem><FormLabel>Сезон</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Зима">Зима</SelectItem>
                          <SelectItem value="Лето">Лето</SelectItem>
                          <SelectItem value="Демисезон">Демисезон</SelectItem>
                          <SelectItem value="Все сезоны">Все сезоны</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="sku" render={({field}) => (
                    <FormItem><FormLabel>Артикул (SKU)</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>
                  )}/>
                </div>
                <div className="flex gap-4 p-2 bg-slate-50 rounded-lg border border-dashed">
                  <FormField control={form.control} name="is_bestseller" render={({field}) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs flex items-center gap-1"><Flame size={12} className="text-orange-500"/> Хит</FormLabel>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="is_new" render={({field}) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs flex items-center gap-1"><Sparkles size={12} className="text-blue-500"/> New</FormLabel>
                    </FormItem>
                  )}/>
                </div>
                <div className="space-y-2">
                  <Label>Фотографии</Label>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((s, i) => (
                      <div key={i} className="relative w-16 h-16 border rounded overflow-hidden">
                        <img src={s} className="w-full h-full object-cover"/>
                        <X size={14} className="absolute top-0 right-0 bg-red-500 text-white" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}/>
                      </div>
                    ))}
                    <button type="button" className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center text-slate-400" onClick={() => fileRef.current?.click()}>
                      {uploading ? <Loader2 className="animate-spin"/> : <ImagePlus size={24}/>}
                    </button>
                  </div>
                  <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={onFile}/>
                </div>
                <Button type="submit" className="w-full bg-blue-600 h-10">{editingId ? "Обновить" : "Создать товар"}</Button>
                {editingId && <Button type="button" variant="ghost" className="w-full" onClick={() => {setEditingId(null); setPreviews([]); form.reset();}}>Отмена</Button>}
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-blue-50/50">
             <CardHeader className="py-2 px-4"><CardTitle className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={12}/> Групповая цена</CardTitle></CardHeader>
             <CardContent className="flex items-end gap-2 pb-3">
               <div className="flex-1 flex gap-1">
                 <Select value={bulkAction.direction} onValueChange={(v:any) => setBulkAction({...bulkAction, direction: v})}>
                   <SelectTrigger className="h-8 text-[10px] bg-white w-24"><SelectValue/></SelectTrigger>
                   <SelectContent><SelectItem value="increase">+</SelectItem><SelectItem value="decrease">-</SelectItem></SelectContent>
                 </Select>
                 <Input type="number" className="h-8 text-[10px] bg-white w-16" value={bulkAction.value} onChange={e => setBulkAction({...bulkAction, value: Number(e.target.value)})}/>
                 <Select value={bulkAction.type} onValueChange={(v:any) => setBulkAction({...bulkAction, type: v})}>
                   <SelectTrigger className="h-8 text-[10px] bg-white w-14"><SelectValue/></SelectTrigger>
                   <SelectContent><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">сом</SelectItem></SelectContent>
                 </Select>
               </div>
               <Button onClick={handleBulkUpdate} size="sm" className="bg-blue-600 h-8 px-2 text-[10px]">ОК</Button>
             </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2 px-4"><div className="relative"><Search className="absolute left-2 top-2 text-slate-400" size={14}/><Input placeholder="Поиск..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)}/></div></CardHeader>
            <CardContent className="max-h-[500px] overflow-auto px-2 pb-2">
              <div className="space-y-1">
                {filtered.map((p:any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
                    <div className="flex items-center gap-2">
                      <img src={p.main_photo} className="w-8 h-8 object-cover rounded"/>
                      <div className="overflow-hidden"><p className="text-[10px] font-bold truncate w-24">{p.name}</p><p className="text-[9px] text-blue-600">{p.price} сом</p></div>
                    </div>
                    <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(p.id)}><Pencil size={10}/></Button><Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => confirm("Удалить?") && onDeleteProduct(p.id)}><Trash2 size={10}/></Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
                  }
