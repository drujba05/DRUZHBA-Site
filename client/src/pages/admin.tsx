import { useProducts, Product } from "@/lib/products";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Icons
import { 
  Plus, Pencil, Trash2, X, ShieldCheck, ImagePlus, 
  Loader2, Search, Flame, Sparkles, Lock, ArrowLeft, RefreshCw 
} from "lucide-react";

// Валидация формы
const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  category: z.string().min(2, "Обязательное поле"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().optional(),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  season: z.enum(["Зима", "Лето", "Все сезоны"]),
  min_order_quantity: z.coerce.number().min(1),
  is_bestseller: z.boolean().optional(),
  is_new: z.boolean().optional(),
});

export default function AdminPage() {
  const { data: products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", category: "Кроссовки", price: 0,
      sizes: "36-41", colors: "", status: "В наличии", 
      season: "Все сезоны", min_order_quantity: 6,
      is_bestseller: false, is_new: true,
    },
  });

  // Вход
  const handleLogin = () => {
    if (password === "Medina050891") {
      setIsAuthenticated(true);
      toast({ title: "Доступ разрешен" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    }
  };

  // Загрузка и сжатие фото
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        setPreviews([base64]); // Для простоты пока 1 фото
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Сохранение
  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (previews.length === 0) {
      toast({ title: "Нет фото", description: "Добавьте хотя бы одно изображение", variant: "destructive" });
      return;
    }

    try {
      const payload = { ...values, main_photo: previews[0], additional_photos: [] };
      if (editingId) {
        await updateProduct({ ...payload, id: editingId });
        toast({ title: "Товар обновлен" });
      } else {
        await addProduct(payload);
        toast({ title: "Товар добавлен" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingId(null);
      setPreviews([]);
      form.reset();
    } catch (e) {
      toast({ title: "Ошибка", description: "Сервер не принял данные", variant: "destructive" });
    }
  }

  // Экран логина
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
        <Card className="w-full max-w-md border-none bg-[#1e293b] shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
              <Lock className="text-white" size={28} />
            </div>
            <CardTitle className="text-2xl font-bold text-white uppercase tracking-widest">Админ-панель</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Введите пароль доступа</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="h-12 bg-[#0f172a] text-white border-slate-700 focus:border-blue-500" 
              />
            </div>
            <Button onClick={handleLogin} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg">
              ВОЙТИ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Шапка */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost"><ArrowLeft size={18} /> Сайт</Button></Link>
            <h1 className="text-xl font-black uppercase tracking-tight">Управление магазином</h1>
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products"] })}>
            <RefreshCw size={16} className="mr-2" /> Обновить базу
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ФОРМА */}
          <div className="lg:col-span-5">
            <Card className="border-none shadow-xl sticky top-8">
              <CardHeader className="bg-slate-900 text-white rounded-t-2xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                  {editingId ? "Редактировать товар" : "Новое поступление"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">Название модели</FormLabel>
                      <FormControl><Input placeholder="Напр: Кроссовки Nike" {...field} className="border-slate-300" /></FormControl></FormItem>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">Цена (сом)</FormLabel>
                        <FormControl><Input type="number" {...field} className="border-slate-300" /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">Категория</FormLabel>
                        <FormControl><Input {...field} className="border-slate-300" /></FormControl></FormItem>
                      )} />
                    </div>

                    <div className="space-y-3">
                      <Label className="font-bold">Фото товара</Label>
                      <div className="flex flex-wrap gap-3">
                        {previews.map((src, i) => (
                          <div key={i} className="relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                            <img src={src} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => setPreviews([])} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={14}/></button>
                          </div>
                        ))}
                        {previews.length === 0 && (
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="h-28 w-28 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-blue-50 hover:border-blue-300 transition-all">
                            <ImagePlus size={24} />
                            <span className="text-[10px] mt-2 font-bold uppercase">Загрузить</span>
                          </button>
                        )}
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="flex gap-4 p-4 bg-slate-100 rounded-2xl border">
                      <FormField control={form.control} name="is_bestseller" render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="font-bold text-orange-600 uppercase text-xs">Хит продаж</FormLabel>
                        </FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-black uppercase shadow-lg shadow-blue-200">
                      {editingId ? "Сохранить изменения" : "Выложить на сайт"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="ghost" className="w-full" onClick={() => { setEditingId(null); setPreviews([]); form.reset(); }}>Отмена</Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* СПИСОК */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input 
                placeholder="Поиск по складу..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg" 
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : (
              <div className="grid gap-3">
                {products?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <img src={p.main_photo} className="h-16 w-16 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-slate-900 uppercase text-sm">{p.name}</h4>
                        <p className="text-blue-600 font-black tracking-tighter">{p.price} сом</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="secondary" onClick={() => {
                        setEditingId(p.id);
                        setPreviews([p.main_photo]);
                        form.reset(p as any);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}><Pencil size={18} /></Button>
                      <Button size="icon" variant="destructive" onClick={() => confirm("Удалить?") && deleteProduct(p.id)}><Trash2 size={18} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
