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
  FormMessage,
  FormDescription,
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
import { Pencil, Trash2, X, ShieldCheck, ImagePlus, Loader2, Search, Flame, Sparkles, Lock, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

// Схема для товара
const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  sku: z.string().optional(),
  category: z.string().min(2, "Обязательное поле"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  season: z.enum(["Зима", "Лето", "Все сезоны"]),
  gender: z.enum(["Универсальные", "Женские", "Мужские", "Детские"]),
  min_order_quantity: z.coerce.number().min(6, "Минимум 6 пар"),
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

export function AdminPanel({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminPanelProps) {
  const { toast } = useToast();
  
  // --- ЛОГИКА АВТОРИЗАЦИИ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const ADMIN_PASSWORD = "admin"; // ТУТ ВАШ ПАРОЛЬ

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: "Доступ разрешен", description: "Добро пожаловать в панель управления" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    }
  };

  // --- ЛОГИКА ТОВАРОВ ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();

  const [bulkAction, setBulkAction] = useState({
    type: "percent" as "percent" | "fixed",
    value: 0,
    direction: "increase" as "increase" | "decrease"
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "", description: "", price: 0,
      sizes: "", colors: "", status: "В наличии", season: "Все сезоны",
      gender: "Универсальные", min_order_quantity: 6, pairs_per_box: 12,
      comment: "", is_bestseller: false, is_new: false,
    },
  });

  useEffect(() => {
    if (editingId) {
      const product = products.find(p => p.id === editingId);
      if (product) {
        form.reset({
          ...product,
          season: (product.season as any) || "Все сезоны",
          gender: (product.gender as any) || "Универсальные",
        });
        setPreviews([product.main_photo, ...(product.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products, form]);

  const handleBulkPriceUpdate = async () => {
    if (bulkAction.value <= 0) return;
    const confirmUpdate = confirm(`Применить изменения цен к ${filteredProducts.length} товарам?`);
    if (!confirmUpdate) return;

    try {
      for (const product of filteredProducts) {
        let newPrice = product.price;
        const val = Number(bulkAction.value);
        if (bulkAction.type === "percent") {
          const diff = (product.price * val) / 100;
          newPrice = bulkAction.direction === "increase" ? product.price + diff : product.price - diff;
        } else {
          newPrice = bulkAction.direction === "increase" ? product.price + val : product.price - val;
        }
        await onUpdateProduct(product.id, { price: Math.round(newPrice) });
      }
      toast({ title: "Цены обновлены!" });
      setBulkAction({ ...bulkAction, value: 0 });
    } catch (e) {
      toast({ title: "Ошибка обновления", variant: "destructive" });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImages(true);
    try {
      for (const file of files) {
        const result = await uploadFile(file);
        if (result) setPreviews(prev => [...prev, result.objectPath]);
      }
    } finally { setIsUploadingImages(false); }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const main_photo = previews[0] || "";
    const additional_photos = previews.slice(1);
    try {
      if (editingId) {
        await onUpdateProduct(editingId, { ...values, main_photo, additional_photos });
        setEditingId(null);
      } else {
        await onAddProduct({ ...values, main_photo, additional_photos });
      }
      form.reset();
      setPreviews([]);
      toast({ title: "Успешно сохранено" });
    } catch (e) { toast({ title: "Ошибка сохранения", variant: "destructive" }); }
  }

  // --- ЭКРАН ВХОДА ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-[2.5rem] shadow-2xl border-none">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-blue-600 h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Вход для админа</CardTitle>
            <CardDescription>Введите пароль для управления магазином</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Ваш пароль" 
                className="h-12 rounded-2xl bg-slate-50 border-none text-center text-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-lg">
                ВОЙТИ
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- ОСНОВНОЙ ЭКРАН АДМИНКИ ---
  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Панель управления</h1>
        <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)} className="rounded-xl">Выйти</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-fit rounded-[2rem] border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? "Редактировать товар" : "Новый товар"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Название</FormLabel><FormControl><Input {...field} className="rounded-xl bg-slate-50 border-none" /></FormControl></FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Цена (пара)</FormLabel><FormControl><Input type="number" {...field} className="rounded-xl bg-slate-50 border-none" /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="min_order_quantity" render={({ field }) => (
                    <FormItem><FormLabel>Мин. заказ</FormLabel><FormControl><Input type="number" step={6} {...field} className="rounded-xl bg-slate-50 border-none" /></FormControl></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sizes" render={({ field }) => (
                    <FormItem><FormLabel>Размеры</FormLabel><FormControl><Input placeholder="36-41" {...field} className="rounded-xl bg-slate-50 border-none" /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="colors" render={({ field }) => (
                    <FormItem><FormLabel>Цвета</FormLabel><FormControl><Input placeholder="Черный, Белый" {...field} className="rounded-xl bg-slate-50 border-none" /></FormControl></FormItem>
                  )} />
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                  <FormField control={form.control} name="is_bestseller" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs cursor-pointer">🔥 Хит</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="is_new" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs cursor-pointer">✨ New</FormLabel>
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-2">
                  <Label>Фотографии ({previews.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                        <img src={src} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                      {isUploadingImages ? <Loader2 className="animate-spin text-slate-400" /> : <ImagePlus className="text-slate-400" />}
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-2xl font-bold">
                    {editingId ? "ОБНОВИТЬ" : "СОЗДАТЬ ТОВАР"}
                  </Button>
                  {editingId && <Button type="button" variant="outline" onClick={() => setEditingId(null)} className="h-12 rounded-2xl">Отмена</Button>}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* ГРУППОВЫЕ ЦЕНЫ */}
          <Card className="border-blue-100 bg-blue-50/40 rounded-[2rem] shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> Групповое изменение цен
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Select value={bulkAction.direction} onValueChange={(v: any) => setBulkAction({...bulkAction, direction: v})}>
                  <SelectTrigger className="w-[130px] h-10 bg-white rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="increase">Увеличить на</SelectItem>
                    <SelectItem value="decrease">Уменьшить на</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex h-10">
                <Input type="number" className="w-20 rounded-l-xl rounded-r-none border-r-0 h-full bg-white" value={bulkAction.value} onChange={e => setBulkAction({...bulkAction, value: Number(e.target.value)})} />
                <Select value={bulkAction.type} onValueChange={(v: any) => setBulkAction({...bulkAction, type: v})}>
                  <SelectTrigger className="w-16 rounded-r-xl rounded-l-none h-full bg-white border-l-0"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl"><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">сом</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={handleBulkPriceUpdate} className="bg-blue-600 h-10 rounded-xl font-bold px-4">ОК</Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-lg">
            <CardHeader className="pb-0 pt-6 px-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Поиск товара..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-11 h-12 rounded-2xl bg-slate-50 border-none" />
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-auto max-h-[600px]">
              <div className="space-y-2">
                {filteredProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-white hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={p.main_photo} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-black leading-none uppercase tracking-tight">{p.name}</p>
                        <p className="text-[11px] font-bold text-blue-600 mt-1">{p.price} сом</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-blue-600" onClick={() => setEditingId(p.id)}><Pencil size={16} /></Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-red-600" onClick={() => { if(confirm('Удалить товар?')) onDeleteProduct(p.id) }}><Trash2 size={16} /></Button>
                    </div>
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
