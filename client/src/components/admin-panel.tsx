import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, X, ImagePlus, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(1),
  sizes: z.string().min(1),
  colors: z.string().min(1),
  status: z.enum(["В наличии", "Нет в наличии", "Ожидается поступление"]),
  min_order_quantity: z.coerce.number().min(1),
  pairs_per_box: z.coerce.number().min(1),
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
      name: "", category: "Обувь", description: "", price: 0, sizes: "36-41", colors: "",
      status: "В наличии", min_order_quantity: 6, pairs_per_box: 12, is_bestseller: false, is_new: false,
    },
  });

  useEffect(() => {
    if (editingId) {
      const p = products.find((item: any) => item.id === editingId);
      if (p) {
        form.reset({ ...p, price: Number(p.price) });
        setPreviews([p.main_photo, ...(p.additional_photos || [])].filter(Boolean));
      }
    }
  }, [editingId, products]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setIsUploading(true);
    try {
      const paths = [];
      for (const f of files) {
        const res = await uploadFile(f);
        if (res?.objectPath) paths.push(res.objectPath);
      }
      setPreviews(prev => [...prev, ...paths]);
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (previews.length === 0) return toast({ title: "Добавьте фото" });
    const data = { ...values, main_photo: previews[0], additional_photos: previews.slice(1) };
    if (editingId) await onUpdateProduct(editingId, data);
    else await onAddProduct(data);
    form.reset();
    setPreviews([]);
    setEditingId(null);
    toast({ title: "Готово!" });
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader><CardTitle>{editingId ? "Правка" : "Новый товар"}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {previews.map((s, i) => (
                  <div key={i} className="relative aspect-square border rounded">
                    <img src={s} className="w-full h-full object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-0 right-0 h-5 w-5" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}><X size={10}/></Button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed flex items-center justify-center bg-slate-50">
                  {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Название</FormLabel><Input {...field} /></FormItem>} />
                <FormField control={form.control} name="colors" render={({ field }) => <FormItem><FormLabel>Цвета</FormLabel><Input {...field} /></FormItem>} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Цена</FormLabel><Input type="number" {...field} /></FormItem>} />
                <FormField control={form.control} name="min_order_quantity" render={({ field }) => <FormItem><FormLabel>Мин. заказ</FormLabel><Input type="number" {...field} /></FormItem>} />
                <FormField control={form.control} name="pairs_per_box" render={({ field }) => <FormItem><FormLabel>Коробка</FormLabel><Input type="number" {...field} /></FormItem>} />
              </div>
              <Button type="submit" disabled={isUploading} className="w-full">{isUploading ? "Загрузка..." : "Сохранить"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {products.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between p-2 border rounded bg-white">
            <div className="flex items-center gap-2"><img src={p.main_photo} className="w-8 h-8 object-cover" /> <span className="text-xs font-bold">{p.name}</span></div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {setEditingId(p.id); window.scrollTo(0,0);}}>Правка</Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onDeleteProduct(p.id)}>Удалить</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
    }
