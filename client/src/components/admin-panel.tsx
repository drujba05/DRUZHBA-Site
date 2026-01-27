import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Добавили импорт
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2, Search, ShieldCheck, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";

const productSchema = z.object({
  name: z.string().min(1, "Введите название"),
  sku: z.string().optional().default(""),
  category: z.string().optional().default("Обувь"),
  description: z.string().optional().default(""), // Добавили описание
  price: z.coerce.number().min(1, "Укажите цену"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.string().default("В наличии"),
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
  const [bulkAction, setBulkAction] = useState({ type: "percent", value: 0, direction: "increase" });

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "Обувь", description: "", price: 0, sizes: "36-41", colors: "Черный",
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
          description: p.description || "" 
        });
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products, form]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Ошибка сервера");
        const data = await res.json();
        if (data.url) setPreviews(prev => [...prev, data.url]);
      }
      toast({ title: "Фото загружены" });
    } catch (err) {
      toast({ title: "Ошибка загрузки в облако", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  async function onSubmit(vals: any) {
    try {
      const payload = {
        ...vals,
        main_photo: previews[0] || "",
        additional_photos: previews.slice(1),
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
      toast({ title: "Ошибка", description: "Проверьте данные", variant: "destructive" });
    }
  }

  const handleBulkUpdate = async () => {
    if (bulkAction.value <= 0) return;
    const filteredItems = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (!confirm(`Обновить цены для ${filteredItems.length} товаров?`)) return;
    try {
      for (const p of filteredItems) {
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
    } catch (e) { toast({ title: "Ошибка обновления", variant: "destructive" }); }
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
                  <FormItem><FormLabel>Название *</FormLabel><FormControl><Input {...field} className="rounded-xl bg-slate-50 border-none"/></FormControl></FormItem>
                )}/>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({field}) => (
                    <FormItem><FormLabel>Цена (пара) *</FormLabel><FormControl><Input type="number" {...field} className="rounded-xl bg-slate-50 border-none"/></FormControl></FormItem>
                  )}/>
                  <FormField control={form.control} name="pairs_per_box" render={({field}) => (
                    <FormItem><FormLabel>В коробе</FormLabel><FormControl><Input placeholder="12 пар" {...field} className="rounded-xl bg-slate-50 border-none"/></FormControl></FormItem>
                  )}/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sizes" render={({field}) => (
                    <FormItem><FormLabel>Размеры *</FormLabel><FormControl><Input placeholder="36-41" {...field} className="rounded-xl bg-slate-50 border-none"/></FormControl></FormItem>
                  )}/>
                  <FormField control={form.control} name="colors" render={({field}) => (
                    <FormItem><FormLabel>Цвета *</FormLabel><FormControl><Input placeholder="Черный, Синий" {...field} className="rounded-xl bg-slate-50 border-none"/></FormControl></FormItem>
                  )}/>
                </div>

                {/* НОВЫЕ ПОЛЯ: СЕЗОН, ПОЛ, СТАТУС */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="season" render={({field}) => (
                    <FormItem><FormLabel>Сезон</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="rounded-xl bg-slate-50 border-none"><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Зима">Зима</SelectItem>
                          <SelectItem value="Лето">Лето</SelectItem>
                          <SelectItem value="Демисезон">Демисезон</SelectItem>
                          <SelectItem value="Все сезоны">Все сезоны</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="gender" render={({field}) => (
                    <FormItem><FormLabel>Для кого</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="rounded-xl bg-slate-50 border-none"><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Мужские">Мужские</SelectItem>
                          <SelectItem value="Женские">Женские</SelectItem>
                          <SelectItem value="Детские">Детские</SelectItem>
                          <SelectItem value="Универсальные">Универсальные</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                </div>

                <FormField control={form.control} name="status" render={({field}) => (
                  <FormItem><FormLabel>Статус наличия</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="rounded-xl bg-slate-50 border-none"><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="В наличии">В наличии</SelectItem>
                        <SelectItem value="Ожидается поступление">Ожидается поступление</SelectItem>
                        <SelectItem value="Нет в наличии">Нет в наличии</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>

                <FormField control={form.control} name="description" render={({field}) => (
                  <FormItem><FormLabel>Описание</FormLabel><FormControl><Textarea {...field} className="rounded-xl bg-slate-50 border-none resize-none" placeholder="Например: Маломерят на размер..." /></FormControl></FormItem>
                )}/>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FormField control={form.control} name="is_bestseller" render={({field}) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs font-black uppercase text-orange-600">ХИТ</FormLabel>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="is_new" render={({field}) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs font-black uppercase text-green-600">NEW</FormLabel>
                    </FormItem>
                  )}/>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest ml-1">Фотографии ({previews.length})</Label>
                  <div className="flex flex-wrap gap-3">
                    {previews.map((s, i) => (
                      <div key={i} className="relative w-20 h-20 border-2 border-white rounded-2xl overflow-hidden shadow-md group">
                        <img src={s} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                        <button type="button" className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}><X size={10}/></button>
                        {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-blue-600 text-[8px] text-white text-center font-bold py-0.5">ГЛАВНОЕ</div>}
                      </div>
                    ))}
                    <button type="button" disabled={uploading} className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors" onClick={() => fileRef.current?.click()}>
                      {uploading ? <Loader2 className="animate-spin text-blue-500"/> : <><Upload size={20} className="mb-1"/><span className="text-[8px] font-bold uppercase">Загрузить</span></>}
                    </button>
                  </div>
                  <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={onFile}/>
                </div>

                <Button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all">
                  {editingId ? "Сохранить изменения" : "Опубликовать товар"}
                </Button>
                {editingId && <Button type="button" variant="ghost" className="w-full h-12 rounded-xl text-slate-400" onClick={() => {setEditingId(null); setPreviews([]); form.reset();}}>Отмена</Button>}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-blue-50/50 rounded-[2rem]">
             <CardHeader className="py-4 px-6"><CardTitle className="text-xs font-black text-blue-800 uppercase flex items-center gap-2"><ShieldCheck size={14}/> Групповое изменение цен</CardTitle></CardHeader>
             <CardContent className="flex items-end gap-2 pb-6 px-6">
               <div className="flex-1 flex gap-1">
                 <Select value={bulkAction.direction} onValueChange={(v:any) => setBulkAction({...bulkAction, direction: v})}>
                   <SelectTrigger className="h-11 text-xs bg-white rounded-xl border-none shadow-sm"><SelectValue/></SelectTrigger>
                   <SelectContent><SelectItem value="increase">Прибавить (+)</SelectItem><SelectItem value="decrease">Вычесть (-)</SelectItem></SelectContent>
                 </Select>
                 <Input type="number" className="h-11 text-xs bg-white rounded-xl border-none shadow-sm w-20" value={bulkAction.value} onChange={e => setBulkAction({...bulkAction, value: Number(e.target.value)})}/>
                 <Select value={bulkAction.type} onValueChange={(v:any) => setBulkAction({...bulkAction, type: v})}>
                   <SelectTrigger className="h-11 text-xs bg-white rounded-xl border-none shadow-sm w-16"><SelectValue/></SelectTrigger>
                   <SelectContent><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">сом</SelectItem></SelectContent>
                 </Select>
               </div>
               <Button onClick={handleBulkUpdate} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11 px-6 font-bold shadow-lg shadow-blue-100">OK</Button>
             </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                <Input placeholder="Поиск товара или артикула..." className="pl-12 h-12 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100" value={search} onChange={e => setSearch(e.target.value)}/>
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-auto p-4 space-y-3">
              {filtered.map((p:any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-[1.5rem] bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <img src={p.main_photo} className="w-14 h-14 object-cover rounded-2xl border-2 border-slate-50 shadow-sm"/>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-slate-900 truncate w-32 uppercase tracking-tighter">{p.name}</p>
                      <div className="flex gap-2">
                        <p className="text-[12px] font-black text-blue-600">{p.price} сом</p>
                        <p className="text-[10px] text-slate-400">{p.season}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-blue-50 text-blue-600" onClick={() => { setEditingId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil size={16}/></Button>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-red-50 text-red-500" onClick={() => confirm("Удалить этот товар?") && onDeleteProduct(p.id)}><Trash2 size={16}/></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
                        }
