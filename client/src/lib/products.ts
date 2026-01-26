import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Product {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  sizes: string;
  colors: string;
  status: "В наличии" | "Нет в наличии" | "Ожидается поступление";
  season?: "Зима" | "Лето" | "Демисезон" | "Все сезоны"; // Добавили Демисезон
  gender?: "Универсальные" | "Женские" | "Мужские" | "Детские";
  min_order_quantity: number;
  pairs_per_box?: string; // Добавили информацию о коробе
  main_photo: string;
  additional_photos: string[];
  comment?: string | null;
  is_bestseller?: boolean;
  is_new?: boolean;
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

async function updateProductApi(id: string | number, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

async function deleteProductApi(id: string | number): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
}

export function useProducts() {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["/api/products"];

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProducts,
  });

  const addMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: string | number; product: Partial<Product> }) => 
      updateProductApi(id, product),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return { 
    products, 
    addProduct: addMutation.mutateAsync,
    updateProduct: (id: string | number, product: Partial<Product>) => updateMutation.mutateAsync({ id, product }),
    deleteProduct: deleteMutation.mutateAsync,
    isLoading,
    error,
  };
                                   }
