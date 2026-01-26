import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Product {
  id: string | number; // Разрешаем и строку, и число
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  sizes: string;
  colors: string;
  status: "В наличии" | "Нет в наличии" | "Ожидается поступление";
  season?: "Зима" | "Лето" | "Все сезоны";
  gender?: "Универсальные" | "Женские" | "Мужские" | "Детские";
  min_order_quantity: number;
  pairs_per_box?: number;
  main_photo: string;
  additional_photos: string[];
  comment?: string | null;
  is_bestseller?: boolean;
  is_new?: boolean;
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
  return res.json();
}

async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Ошибка при создании товара");
  return res.json();
}

// Изменили id: string | number для надежности
async function updateProductApi(id: string | number, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH", // Часто серверы используют PATCH для частичного обновления, проверим на всякий случай PUT если не сработает
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
     // Если PATCH не сработал, пробуем старый добрый PUT
     const resPut = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
     });
     if (!resPut.ok) throw new Error("Ошибка при обновлении товара");
     return resPut.json();
  }
  return res.json();
}

async function deleteProductApi(id: string | number): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Ошибка при удалении");
}

export function useProducts() {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["/api/products"]; // Используем стандартный ключ

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProducts,
  });

  const addMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: string | number; product: Partial<Product> }) => 
      updateProductApi(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return { 
    products, 
    addProduct: addMutation.mutateAsync,
    // Приводим ID к числу или строке автоматически
    updateProduct: (id: string | number, product: Partial<Product>) => 
      updateMutation.mutateAsync({ id, product }),
    deleteProduct: deleteMutation.mutateAsync,
    isLoading,
    error,
  };
}
