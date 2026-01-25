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
          season: (product.season as "Зима" | "Лето" | "Все сезоны") || "Все сезоны",
          gender: (product.gender as "Универсальные" | "Женские" | "Мужские" | "Детские") || "Универсальные",
          min_order_quantity: product.min_order_quantity,
          pairs_per_box: product.pairs_per_box || 12,
          comment: product.comment || "",
          is_bestseller: product.is_bestseller || false,
          is_new: product.is_new || false,
        });
        setPreviews([product.main_photo, ...product.additional_photos].filter(Boolean));
      }
    } else {
      form.reset({
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
      });
      setPreviews([]);
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
        if (result) {
          uploadedUrls.push(result.objectPath);
        }
      }
      
      if (uploadedUrls.length > 0) {
        setPreviews(prev => [...prev, ...uploadedUrls]);
        toast({
          title: "Фото загружены",
          description: `Загружено ${uploadedUrls.length} фото`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить фото",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const main_photo = previews[0] || "https://images.unsplash.com/photo-1603487742131-4160d6e6828e?w=800&q=80";
    const additional_photos = previews.slice(1);

    try {
      if (editingId) {
        await onUpdateProduct(editingId, {
          ...values,
          sku: values.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
          description: values.description || "",
          main_photo,
          additional_photos,
        });
        toast({
          title: "Товар обновлен",
          description: `${values.name} успешно обновлен.`,
        });
        setEditingId(null);
      } else {
        await onAddProduct({
          ...values,
          sku: values.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
          description: values.description || "",
          main_photo,
          additional_photos,
        });
        toast({
          title: "Товар добавлен",
          description: `${values.name} успешно добавлен в каталог.`,
        });
      }
      form.reset();
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить товар. Попробуйте снова.",
        variant: "destructive",
      });
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите удалить товар "${name}"?`)) {
      onDeleteProduct(id);
      toast({
        title: "Товар удален",
        description: `Товар "${name}" удален из каталога.`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{editingId ? "Редактировать товар" : "Добавить товар"}</CardTitle>
              <CardDescription>Заполните параметры товара</CardDescription>
            </div>
            {editingId && (
              <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название</FormLabel>
                      <FormControl>
                        <Input placeholder="Сапоги..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Категория</FormLabel>
                        <FormControl>
                          <Input placeholder="Сапоги" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена (сом)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sizes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Размеры</FormLabel>
                        <FormControl>
                          <Input placeholder="36-41" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цвета</FormLabel>
                        <FormControl>
                          <Input placeholder="Черный..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Статус</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="В наличии">В наличии</SelectItem>
                            <SelectItem value="Нет в наличии">Нет в наличии</SelectItem>
                            <SelectItem value="Ожидается поступление">Ожидается поступление</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сезон</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Все сезоны">Все сезоны</SelectItem>
                            <SelectItem value="Зима">Зима</SelectItem>
                            <SelectItem value="Лето">Лето</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пол</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Универсальные">Универсальные</SelectItem>
                            <SelectItem value="Женские">Женские</SelectItem>
                            <SelectItem value="Мужские">Мужские</SelectItem>
                            <SelectItem value="Детские">Детские</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pairs_per_box"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>В коробке (пар)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Комментарий</FormLabel>
                        <FormControl>
                          <Input placeholder="Маломерит" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-6 p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="is_bestseller"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <FormLabel className="text-sm font-medium cursor-pointer m-0">Хит продаж</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_new"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-green-500" />
                          <FormLabel className="text-sm font-medium cursor-pointer m-0">Новинка</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Фотографии товара</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5 uppercase font-bold">
                            Главное
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImages}
                      className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
                    >
                      {isUploadingImages ? (
                        <>
                          <Loader2 className="h-6 w-6 mb-1 animate-spin" />
                          <span className="text-[10px]">Загрузка...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-6 w-6 mb-1" />
                          <span className="text-[10px]">Добавить</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  <p className="text-[10px] text-muted-foreground">Первое фото будет основным</p>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Обновить данные" : "Добавить в каталог"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Массовые действия</CardTitle>
            <CardDescription>Импорт и экспорт каталога через Excel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative group">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
              <p className="text-sm font-medium">Загрузить Excel-файл</p>
              <p className="text-xs text-muted-foreground mt-1">.xlsx или .xls</p>
              <Input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept=".xlsx,.xls"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" className="w-full" onClick={() => toast({ title: "Импорт начат" })}>
                Импортировать
              </Button>
              <Button variant="outline" className="w-full" onClick={() => toast({ title: "Экспорт начат" })}>
                Экспортировать
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-heading font-semibold text-blue-800 text-sm mb-2 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" /> Справка
              </h4>
              <ul className="text-[11px] text-blue-700 list-disc list-inside space-y-1">
                <li>Колонки: Название, Категория, Цена, Размеры, Цвета</li>
                <li>Минимальный заказ устанавливается автоматически (6 пар)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Список всех товаров</CardTitle>
              <CardDescription>Редактируйте или удаляйте позиции из списка ниже</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-name"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-3 text-left font-medium">Наименование</th>
                  <th className="p-3 text-left font-medium">Категория</th>
                  <th className="p-3 text-left font-medium">Цена</th>
                  <th className="p-3 text-left font-medium">Сезон</th>
                  <th className="p-3 text-left font-medium">Статус</th>
                  <th className="p-3 text-right font-medium">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.sku}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3 font-semibold">{p.price} сом</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        (p.season || "Все сезоны") === "Зима" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                        (p.season || "Все сезоны") === "Лето" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {p.season || "Все сезоны"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        p.status === "В наличии" ? "bg-green-50 text-green-700 border-green-200" :
                        p.status === "Нет в наличии" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => {
                          setEditingId(p.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Правка
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
