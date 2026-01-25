import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Product {
  id: string;
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
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

async function updateProductApi(id: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

async function deleteProductApi(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

export function useProducts() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const addMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<Product> }) => 
      updateProductApi(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return { 
    products, 
    addProduct: addMutation.mutateAsync,
    updateProduct: (id: string, product: Partial<Product>) => updateMutation.mutateAsync({ id, product }),
    deleteProduct: deleteMutation.mutateAsync,
    isLoading,
    error,
  };
}
