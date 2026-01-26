import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2, Search, Flame, Sparkles, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(1, "Введите название"),
  sku: z.string().optional().default(""),
  category: z.string().optional().default("Обувь"),
  price: z.coerce.number().min(1, "Укажите цену"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]).default("В наличии"),
  season: z.string().default("Все сезоны"),
  gender: z.string().default("Универсальные"),
  min_order_quantity: z.coerce.number().min(1).default(6),
  pairs_per_box: z.string().optional().default(""),
  is_bestseller: z.boolean().optional().default(false),
  is_new: z.boolean().optional().default(true),
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
        form.reset({
          ...p,
          sku: p.sku || "",
          pairs_per_box: p.pairs_per_box || "",
        });
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products, form]);

  const onFile = async (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    setUploading(true);
    try {
      for (const f of files) {
        const res = await uploadFile(f);
        if (res) setPreviews(prev => [...prev, res.objectPath]);
      }
    } catch (err) {
      toast({ title: "Ошибка загрузки фото", variant: "destructive" });
    } finally { setUploading(false); }
  };

  async function onSubmit(vals: any) {
    try {
      // Подготовка данных: убираем лишнее и добавляем фото
      const payload = {
        ...vals,
        main_photo: previews[0] || "",
        additional_photos: previews.slice(1),
        description: vals.description || "", // Заглушка для БД
      };

      if (editingId) {
        await onUpdateProduct(editingId, payload);
        toast({ title: "Товар обновлен" });
      } else {
        await onAddProduct(payload);
        toast({ title: "Товар успешно добавлен" });
      }
      
      setEditingId(null);
      setPreviews([]);
      form.reset();
    } catch (e: any) {
      console.error("Submit error:", e);
      toast({ 
        title: "Ошибка", 
        description: "Сервер отклонил данные. Проверьте обязательные поля.",
        variant: "destructive" 
      });
    }
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
    } catch (e) { toast({ title: "Ошибка при обновлении", variant: "destructive" }); }
  };

  const filtered = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader><CardTitle className="text-xl flex items-center gap-2">{editingId ? <Pencil size={20}/> : <Plus size={20}/>} {editingId ? "Редактировать" : "Новый товар"}</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({field}) => (
                  <FormItem><FormLabel>Название *</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({field}) => (
                    <FormItem><FormLabel>Цена (пара) *</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>
                  )}/>
                  <FormField control={form.control} name="pairs_per_box" render={({field}) => (
                    <FormItem><FormLabel>В коробе (инфо)</FormLabel><FormControl><Input placeholder="12 пар" {...field}/></FormControl></FormItem>
                  )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sizes" render={({field}) => (
                    <FormItem><FormLabel>Размеры *</FormLabel><FormControl><Input placeholder="36-41" {...field}/></FormControl></FormItem>
                  )}/>
                  <FormField control={form.control} name="colors" render={({field}) => (
                    <FormItem><FormLabel>Цвета *</FormLabel><FormControl><Input placeholder="Черный, Синий" {...field}/></FormControl></FormItem>
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
                    <FormItem><FormLabel>Артикул</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>
                  )}/>
                </div>
                <div className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-dashed">
                  <FormField control={form.control} name="is_bestseller" render={({field}) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs font-bold">ХИТ</FormLabel>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="is_new" render={({field}) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs font-bold">NEW</FormLabel>
                    </FormItem>
                  )}/>
                </div>
                <div className="space-y-2">
                  <Label>Фотографии ({previews.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((s, i) => (
                      <div key={i} className="relative w-20 h-20 border rounded-xl overflow-hidden shadow-sm">
                        <img src={s} className="w-full h-full object-cover"/>
                        <button type="button" className="absolute top-0 right-0 bg-red-500 text-white p-0.5" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}><X size={12}/></button>
                      </div>
                    ))}
                    <button type="button" className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50" onClick={() => fileRef.current?.click()}>
                      {uploading ? <Loader2 className="animate-spin"/> : <ImagePlus size={24}/>}
                    </button>
                  </div>
                  <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={onFile}/>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold uppercase tracking-widest shadow-lg">
                  {editingId ? "Сохранить изменения" : "Добавить товар"}
                </Button>
                {editingId && <Button type="button" variant="ghost" className="w-full" onClick={() => {setEditingId(null); setPreviews([]); form.reset();}}>Отмена</Button>}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ПРАВАЯ КОЛОНКА: МАССОВЫЕ ДЕЙСТВИЯ И СПИСОК */}
        <div className="space-y-4">
          <Card className="border-none shadow-md bg-blue-50/50 rounded-[2rem]">
             <CardHeader className="py-3 px-6"><CardTitle className="text-xs font-black text-blue-800 uppercase flex items-center gap-2"><ShieldCheck size={14}/> Групповое изменение цен</CardTitle></CardHeader>
             <CardContent className="flex items-end gap-2 pb-6 px-6">
               <div className="flex-1 flex gap-1">
                 <Select value={bulkAction.direction} onValueChange={(v:any) => setBulkAction({...bulkAction, direction: v})}>
                   <SelectTrigger className="h-10 text-xs bg-white rounded-xl"><SelectValue/></SelectTrigger>
                   <SelectContent><SelectItem value="increase">Прибавить (+)</SelectItem><SelectItem value="decrease">Вычесть (-)</SelectItem></SelectContent>
                 </Select>
                 <Input type="number" className="h-10 text-xs bg-white rounded-xl w-20" value={bulkAction.value} onChange={e => setBulkAction({...bulkAction, value: Number(e.target.value)})}/>
                 <Select value={bulkAction.type} onValueChange={(v:any) => setBulkAction({...bulkAction, type: v})}>
                   <SelectTrigger className="h-10 text-xs bg-white rounded-xl w-16"><SelectValue/></SelectTrigger>
                   <SelectContent><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">сом</SelectItem></SelectContent>
                 </Select>
               </div>
               <Button onClick={handleBulkUpdate} className="bg-blue-600 rounded-xl h-10 px-4 font-bold">OK</Button>
             </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden">
            <CardHeader className="py-4 px-6 bg-white border-b border-slate-50"><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={16}/><Input placeholder="Поиск по названию или артикулу..." className="pl-10 h-10 rounded-xl border-slate-100" value={search} onChange={e => setSearch(e.target.value)}/></div></CardHeader>
            <CardContent className="max-h-[600px] overflow-auto p-2 bg-slate-50/30">
              <div className="space-y-2">
                {filtered.map((p:any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={p.main_photo} className="w-12 h-12 object-cover rounded-xl border"/>
                      <div className="overflow-hidden"><p className="text-xs font-black text-slate-800 truncate w-32 uppercase">{p.name}</p><p className="text-[10px] font-bold text-blue-600">{p.price} сом</p></div>
                    </div>
                    <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-blue-50 text-blue-600" onClick={() => setEditingId(p.id)}><Pencil size={14}/></Button><Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-red-50 text-red-500" onClick={() => confirm("Удалить этот товар?") && onDeleteProduct(p.id)}><Trash2 size={14}/></Button></div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-center py-10 text-slate-400 text-sm italic">Товары не найдены</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
