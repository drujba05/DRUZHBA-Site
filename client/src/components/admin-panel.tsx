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
import { Upload, FileSpreadsheet, Pencil, Trash2, X, ShieldCheck, ImagePlus, Loader2, Search, Flame, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

// Обновленная схема с Демисезоном
const productSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  sku: z.string().optional(),
  category: z.string().min(2, "Обязательное поле"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  sizes: z.string().min(1, "Укажите размеры"),
  colors: z.string().min(1, "Укажите цвета"),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  season: z.enum(["Зима", "Лето", "Демисезон", "Все сезоны"]),
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      price: 0,
      sizes: "",
      colors: "",
      status: "В наличии",
      season: "Все сезоны",
      gender: "Универсальные",
      min_order_quantity: 6,
      pairs_per_box: 12,
      comment: "",
      is_bestseller: false,
      is_new: false,
    },
  });

  useEffect(() => {
    if (editingId) {
      const product = products.find(p => p.id === editingId);
      if (product) {
        form.reset({
          name: product.name,
          sku: product.sku,
          category: product.category,
          description: product.description,
          price: product.price,
          sizes: product.sizes,
          colors: product.colors,
          status: product.status,
          season: (product.season as any) || "Все сезоны",
          gender: (product.gender as any) || "Универсальные",
          min_order_quantity: product.min_order_quantity,
          pairs_per_box: product.pairs_per_box || 12,
          comment: product.comment || "",
          is_bestseller: product.is_bestseller || false,
          is_new: product.is_new || false,
        });
        setPreviews([product.main_photo, ...product.additional_photos].filter(Boolean));
      }
    }
  }, [editingId, products, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const result = await uploadFile(file);
        if (result) uploadedUrls.push(result.objectPath);
      }
      if (uploadedUrls.length > 0) {
        setPreviews(prev => [...prev, ...uploadedUrls]);
        toast({ title: "Фото загружены", description: `Загружено ${uploadedUrls.length} фото` });
      }
    } catch (error) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removePreview = (index: number) => setPreviews(prev => prev.filter((_, i) => i !== index));

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const main_photo = previews[0] || "https://images.unsplash.com/photo-1603487742131-4160d6e6828e?w=800&q=80";
    const additional_photos = previews.slice(1);

    try {
      if (editingId) {
        await onUpdateProduct(editingId, { ...values, main_photo, additional_photos });
        toast({ title: "Товар обновлен" });
        setEditingId(null);
      } else {
        await onAddProduct({ ...values, main_photo, additional_photos });
        toast({ title: "Товар добавлен" });
      }
      form.reset();
      setPreviews([]);
    } catch (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Редактирование" : "Новый товар"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Название модели</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Цена (сом)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="pairs_per_box" render={({ field }) => (
                  <FormItem><FormLabel>Пар в коробке</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="season" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сезон</FormLabel>
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
                <FormField control={form.control} name="colors" render={({ field }) => (
                  <FormItem><FormLabel>Цвета (через запятую)</FormLabel><FormControl><Input placeholder="Черный, Синий" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sizes" render={({ field }) => (
                  <FormItem><FormLabel>Размерный ряд</FormLabel><FormControl><Input placeholder="40-45" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Категория</FormLabel><FormControl><Input placeholder="Кроссовки" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <div className="flex gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <FormField control={form.control} name="is_bestseller" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500"/> Хит</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="is_new" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer flex items-center gap-1"><Sparkles className="w-4 h-4 text-green-500"/> Новинка</FormLabel>
                  </FormItem>
                )} />
              </div>

              <div className="space-y-3">
                <Label>Фотографии</Label>
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((src, index) => (
                    <div key={index} className="relative aspect-square border rounded-lg overflow-hidden group">
                      <img src={src} className="object-cover w-full h-full" />
                      <button type="button" onClick={() => removePreview(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X className="w-3 h-3"/></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-blue-500">
                    <ImagePlus />
                    <span className="text-[10px] mt-1">Добавить</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                {editingId ? "Сохранить изменения" : "Опубликовать товар"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
            }
