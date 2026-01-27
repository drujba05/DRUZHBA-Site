import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Loader2, Search, ShieldCheck, Upload, ExternalLink, LayoutDashboard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";

const productSchema = z.object({
  name: z.string().min(1, "Введите название"),
  sku: z.string().optional().default(""),
  category: z.string().optional().default("Обувь"),
  description: z.string().optional().default(""),
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
      toast({ title: "ФОТО ЗАГРУЖЕНЫ", className: "bg-green-600 text-white border-none rounded-2xl mb-2" });
    } catch (err) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
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
        toast({ title: "ТОВАР ОБНОВЛЕН", className: "bg-blue-600 text-white border-none rounded-2xl mb-2" });
      } else {
        await onAddProduct(payload);
        toast({ title: "ТОВАР ДОБАВЛЕН", className: "bg-slate-900 text-white border-none rounded-2xl mb-2" });
      }
      setEditingId(null);
      setPreviews([]);
      form.reset();
    } catch (e: any) {
      toast({ title: "Ошибка", variant: "destructive" });
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
      toast({ title: "ЦЕНЫ ОБНОВЛЕНЫ", className: "bg-orange-500 text-white border-none rounded-2xl mb-2" });
    } catch (e) { toast({ title: "Ошибка", variant: "destructive" }); }
  };

  const filtered = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Админ-панель</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Управление DRUZHBA</p>
          </div>
        </div>
        <Button variant="outline" className="rounded-2xl border-slate-200 hover:bg-slate-50 gap-2 h-12 px-6 font-bold" asChild>
          <a href="/" target="_blank"><ExternalLink size={16} /> Посмотреть сайт</a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <Card className="lg:col-span-7 border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-slate-700">
              {editingId ? <Pencil size={18} className="text-blue-500"/> : <Plus size={18} className="text-green-500"/>} 
              {editingId ? "Редактирование" : "Новый товар"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="name" render={({field}) => (
                  <FormItem><FormLabel className="font-bold text-slate-500 uppercase text-[10px]">Название модели *</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold focus:ring-2 focus:ring-blue-100"/></FormControl></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({field}) => (
                    <FormItem><FormLabel className="font-bold text-slate-500 uppercase text-[10px]">Цена за пару *</FormLabel><FormControl><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold"/></FormControl></FormItem>
                  )}/>
                  <FormField control={form.control} name="pairs_per_box" render={({field}) => (
                    <FormItem><FormLabel className="font-bold text-slate-500 uppercase text-[10px]">В коробе</FormLabel><FormControl><Input placeholder="12" {...field} className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold"/></FormControl></FormItem>
                  )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="season" render={({field}) => (
                    <FormItem><FormLabel className="font-bold text-slate-500 uppercase text-[10px]">Сезон</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold"><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          <SelectItem value="Зима">Зима</SelectItem><SelectItem value="Лето">Лето</SelectItem><SelectItem value="Демисезон">Демисезон</SelectItem><SelectItem value="Все сезоны">Все сезоны</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="gender" render={({field}) => (
                    <FormItem><FormLabel className="font-bold text-slate-500 uppercase text-[10px]">Для кого</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold"><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          <SelectItem value="Мужские">Мужские</SelectItem><SelectItem value="Женские">Женские</SelectItem><SelectItem value="Детские">Детские</SelectItem><SelectItem value="Универсальные">Универсальные</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="description" render={({field}) => (
                  <FormItem><FormLabel className="font-bold text-slate-500 uppercase text-[10px]">Описание</FormLabel><FormControl><Textarea {...field} className="rounded-xl bg-slate-50 border-none resize-none p-4 font-medium" placeholder="Особенности..." /></FormControl></FormItem>
                )}/>
                <div className="flex gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FormField control={form.control} name="is_bestseller" render={({field}) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-[10px] font-black uppercase text-orange-600 tracking-widest cursor-pointer">ХИТ</FormLabel>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="is_new" render={({field}) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-[10px] font-black uppercase text-green-600 tracking-widest cursor-pointer">NEW</FormLabel>
                    </FormItem>
                  )}/>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest ml-1">Фото ({previews.length})</Label>
                  <div className="flex flex-wrap gap-3">
                    {previews.map((s, i) => (
                      <div key={i} className="relative w-24 h-24 border-4 border-white rounded-[1.5rem] overflow-hidden shadow-lg group">
                        <img src={s} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                        <button type="button" className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}><X size={12}/></button>
                      </div>
                    ))}
                    <button type="button" disabled={uploading} className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-all group" onClick={() => fileRef.current?.click()}>
                      {uploading ? <Loader2 className="animate-spin text-blue-500"/> : <><Upload size={24} className="mb-1 group-hover:text-blue-500"/><span className="text-[8px] font-black uppercase">Добавить</span></>}
                    </button>
                  </div>
                  <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={onFile}/>
                </div>
                <Button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:scale-[1.01] active:scale-[0.98]">
                  {editingId ? "Сохранить изменения" : "Опубликовать в каталог"}
                </Button>
                {editingId && <Button type="button" variant="ghost" className="w-full h-12 rounded-xl text-slate-400 font-bold" onClick={() => {setEditingId(null); setPreviews([]); form.reset();}}>Отмена</Button>}
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                <Input placeholder="Найти в базе..." className="pl-12 h-12 rounded-2xl bg-slate-50 border-none font-bold placeholder:text-slate-300" value={search} onChange={e => setSearch(e.target.value)}/>
              </div>
            </CardHeader>
            <CardContent className="max-h-[700px] overflow-auto p-4 space-y-3">
              {filtered.map((p:any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-[1.8rem] bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={p.main_photo} className="w-16 h-16 object-cover rounded-[1.2rem] border-2 border-slate-50 shadow-sm"/>
                    <div className="overflow-hidden">
                      <p className="text-[12px] font-black text-slate-900 truncate w-40 uppercase tracking-tighter">{p.name}</p>
                      <p className="text-[13px] font-black text-blue-600">{p.price} сом</p>
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
