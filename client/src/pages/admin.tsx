"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPanel } from "@/components/admin-panel";
import { useProducts } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = "123456"; // ← поменяй при необходимости
const STORAGE_KEY = "admin_auth";

export default function AdminPage() {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const auth = localStorage.getItem(STORAGE_KEY);
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Вход
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать в админ-панель",
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Неверный пароль",
        variant: "destructive",
      });
    }
  };

  // Выход
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  };

  // 🔐 Форма входа
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Админ-вход</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" onClick={handleLogin}>
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Админ-панель
  return (
    <div className="min-h-screen bg-background">
      {/* Верхняя панель */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 py-3">
        <h1 className="text-lg font-semibold">Админ-панель</h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            На сайт
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </div>

      {/* Контент */}
      <div className="p-4">
        <AdminPanel
          products={products}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
        />
      </div>
    </div>
  );
          }
