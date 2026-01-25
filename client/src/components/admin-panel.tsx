import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, X, ImagePlus, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/use-upload";

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(1),
  sizes: z.string().min(1),
  colors: z.string().min(1),
  status: z.string(),
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
      name: "", category: "Обувь", price: 0, sizes: "36-41", colors: "",
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
        <CardHeader><CardTitle>{editingId ? "Редактирование" : "Новый товар"}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {previews.map((s, i) => (
                  <div key={i} className="relative aspect-square border rounded">
                    <img src={s} className="w-full h-full object-cover rounded" />
                    <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 rounded-full" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}><X size={10}/></Button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed flex flex-col items-center justify-center bg-slate-50 rounded">
                  {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : <ImagePlus className="text-slate-400" />}
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
                <FormField control={form.control} name="pairs_per_box" render={({ field }) => <FormItem><FormLabel>В коробке</FormLabel><Input type="number" {...field} /></FormItem>} />
              </div>
              <Button type="submit" disabled={isUploading} className="w-full bg-blue-600 hover:bg-blue-700">
                {isUploading ? "Загрузка..." : editingId ? "Обновить" : "Сохранить товар"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="font-bold text-slate-500 uppercase text-xs">Список товаров ({products.length})</h3>
        {products.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between p-2 border rounded bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <img src={p.main_photo} className="w-10 h-10 object-cover rounded" />
              <div className="flex flex-col"><span className="text-xs font-bold leading-none">{p.name}</span><span className="text-[10px] text-blue-600 font-bold">{p.price} сом</span></div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => {setEditingId(p.id); window.scrollTo({top: 0, behavior: 'smooth'});}}>ПРАВКА</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => onDeleteProduct(p.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
                                            }
