// ... (все импорты остаются прежними)

export function AdminPanel({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminPanelProps) {
  const { toast } = useToast();
  // ИСПРАВЛЕНО: ID теперь может быть и строкой, и числом для гибкости
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUpload();

  const filteredProducts = (products || []).filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "Обувь", description: "", price: 0,
      sizes: "36-41", colors: "Черный", status: "В наличии", season: "Все сезоны",
      gender: "Универсальные", min_order_quantity: 6, pairs_per_box: 12,
      comment: "", is_bestseller: false, is_new: true,
    },
  });

  useEffect(() => {
    if (editingId !== null) {
      // ИСПРАВЛЕНО: Сравнение через == чтобы игнорировать тип string/number
      const product = products.find(p => p.id == editingId);
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

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (previews.length === 0) {
      return toast({ title: "Ошибка", description: "Нужно хотя бы одно фото", variant: "destructive" });
    }

    const main_photo = previews[0];
    const additional_photos = previews.slice(1);

    try {
      if (editingId !== null) {
        // Приводим ID к строке для функции, если она того требует
        await onUpdateProduct(editingId.toString(), { ...values, main_photo, additional_photos });
        toast({ title: "Обновлено!" });
      } else {
        await onAddProduct({ ...values, main_photo, additional_photos });
        toast({ title: "Товар создан!" });
      }
      
      // Сброс формы
      setEditingId(null);
      setPreviews([]);
      form.reset();
    } catch (e: any) {
      console.error("Ошибка сохранения:", e);
      toast({ 
        title: "Критическая ошибка", 
        description: e.message || "Сервер отклонил запрос. Проверьте размер фото.", 
        variant: "destructive" 
      });
    }
  }

  // ... (остальной JSX код)
  // В списке товаров замени кнопку редактирования на:
  // onClick={() => setEditingId(p.id)}
